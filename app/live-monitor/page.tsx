"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { HRVWebSocket } from "@/lib/websocket/hrvWebSocket";
import { VideoFrameProcessor } from "@/lib/video/frameProcessor";

interface HRVData {
	heartRate: number;
	rrInterval: number;
	sdnn: number;
	rmssd: number;
	pnn50: number;
	lfhfRatio: number;
	timestamp: string;
}

export default function LiveMonitor() {
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hrvData, setHrvData] = useState<HRVData | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const wsRef = useRef<HRVWebSocket | null>(null);
	const frameProcessorRef = useRef<VideoFrameProcessor | null>(null);

	useEffect(() => {
		wsRef.current = new HRVWebSocket();
		wsRef.current.connect();
		wsRef.current.addMessageHandler((message) => {
			if (message.type === "hrv_data") {
				setHrvData(message.data as HRVData);
			}
		});

		return () => {
			wsRef.current?.disconnect();
		};
	}, []);

	const startStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();

				frameProcessorRef.current = new VideoFrameProcessor();
				frameProcessorRef.current.startProcessing(
					videoRef.current,
					(frameData) => {
						if (wsRef.current) {
							wsRef.current.sendVideoFrame(frameData);
							wsRef.current.startMonitoring();
						}
					}
				);

				setIsStreaming(true);
				setError(null);
			}
		} catch (err) {
			setError(
				"Failed to access camera. Please ensure camera permissions are granted."
			);
			console.error("Error accessing camera:", err);
		}
	};

	const stopStream = () => {
		if (videoRef.current?.srcObject) {
			const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
			tracks.forEach((track) => track.stop());
			videoRef.current.srcObject = null;
		}
		frameProcessorRef.current?.stopProcessing();
		if (wsRef.current) {
			wsRef.current.stopMonitoring();
		}
		setIsStreaming(false);
	};

	return (
		<div className="container mx-auto p-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Video Stream</CardTitle>
							<CardDescription>
								Live camera feed for HRV monitoring
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
								<video
									ref={videoRef}
									className="absolute inset-0 w-full h-full object-cover"
								/>
							</div>
							{error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
							<div className="mt-4">
								<Button
									onClick={isStreaming ? stopStream : startStream}
									variant={isStreaming ? "destructive" : "default"}
								>
									{isStreaming ? "Stop Stream" : "Start Stream"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>HRV Metrics</CardTitle>
							<CardDescription>
								Real-time heart rate variability measurements
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<MetricCard
									title="Heart Rate"
									value={hrvData?.heartRate ?? "--"}
									unit="bpm"
								/>
								<MetricCard
									title="RR Interval"
									value={hrvData?.rrInterval ?? "--"}
									unit="ms"
								/>
								<MetricCard
									title="SDNN"
									value={hrvData?.sdnn ?? "--"}
									unit="ms"
								/>
								<MetricCard
									title="RMSSD"
									value={hrvData?.rmssd ?? "--"}
									unit="ms"
								/>
								<MetricCard
									title="pNN50"
									value={hrvData?.pnn50 ?? "--"}
									unit="%"
								/>
								<MetricCard
									title="LF/HF Ratio"
									value={hrvData?.lfhfRatio ?? "--"}
									unit=""
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	title,
	value,
	unit,
}: {
	title: string;
	value: number | string;
	unit: string;
}) {
	return (
		<Card>
			<CardHeader className="p-4">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<p className="text-2xl font-bold">
					{value} {unit}
				</p>
			</CardContent>
		</Card>
	);
}
