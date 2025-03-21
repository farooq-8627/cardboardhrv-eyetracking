"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ConnectionService } from "@/services/ConnectionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Camera, Heart, Loader2 } from "lucide-react";

// Helper function to check if getUserMedia is supported
const checkMediaSupport = () => {
	return !!navigator?.mediaDevices?.getUserMedia;
};

export default function ConnectPhoneSessionPage() {
	const router = useRouter();
	const params = useParams();
	const sessionId = params?.sessionId as string;
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState<string>("new");
	const [isMeasuring, setIsMeasuring] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const connectionRef = useRef<ConnectionService | null>(null);
	const animationFrameRef = useRef<number>();

	useEffect(() => {
		let isMounted = true;

		const initializeConnection = async () => {
			try {
				if (!sessionId) {
					throw new Error("Invalid session ID");
				}

				setError("");
				setIsLoading(true);

				// Check if getUserMedia is supported
				if (!checkMediaSupport()) {
					throw new Error(
						"Camera access is not supported in your browser. Please use a modern browser with HTTPS."
					);
				}

				// Request camera access
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "user" },
				});

				if (!isMounted) {
					stream.getTracks().forEach((track) => track.stop());
					return;
				}

				// Set up video preview
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}

				// Initialize connection
				const connection = new ConnectionService(
					sessionId,
					"mobile",
					(status) => {
						if (isMounted) {
							setConnectionStatus(status);
							if (status === "connected") {
								setIsLoading(false);
							}
						}
					}
				);

				// Initialize as mobile device
				await connection.initializeAsMobile(stream);
				connectionRef.current = connection;
			} catch (error) {
				console.error("Connection error:", error);
				if (isMounted) {
					setError(
						error instanceof Error
							? error.message
							: "Failed to initialize connection"
					);
					setIsLoading(false);
				}
			}
		};

		// Delay initialization slightly to ensure the page is fully loaded
		const timer = setTimeout(() => {
			initializeConnection();
		}, 100);

		return () => {
			isMounted = false;
			clearTimeout(timer);
			if (connectionRef.current) {
				connectionRef.current.disconnect();
				connectionRef.current = null;
			}
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [sessionId]);

	const processVideoFrame = () => {
		if (
			!videoRef.current ||
			!canvasRef.current ||
			!connectionRef.current ||
			!isMeasuring
		) {
			return;
		}

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		if (!context) return;

		// Set canvas size to match video
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		// Draw the current video frame
		context.drawImage(video, 0, 0);

		// Get the center pixel data
		const centerX = Math.floor(canvas.width / 2);
		const centerY = Math.floor(canvas.height / 2);
		const pixelData = context.getImageData(centerX, centerY, 1, 1).data;

		// Extract red value (used for heart rate detection)
		const redValue = pixelData[0];

		// Send heart rate data
		connectionRef.current.sendHeartRateData({
			redValue,
			timestamp: Date.now(),
		});

		// Schedule next frame
		animationFrameRef.current = requestAnimationFrame(processVideoFrame);
	};

	const toggleMeasurement = () => {
		setIsMeasuring((prev) => !prev);
		if (!isMeasuring) {
			animationFrameRef.current = requestAnimationFrame(processVideoFrame);
		} else if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto space-y-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Camera className="h-5 w-5" />
							Phone Camera
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="relative aspect-video bg-black rounded-lg overflow-hidden">
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted
								className="absolute inset-0 w-full h-full object-cover"
							/>
							<canvas ref={canvasRef} className="hidden" />
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Heart
									className={
										connectionStatus === "connected"
											? "text-green-500"
											: "text-yellow-500"
									}
								/>
								<span className="capitalize">{connectionStatus}</span>
							</div>

							{isLoading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : connectionStatus === "connected" ? (
								<Button
									onClick={toggleMeasurement}
									variant={isMeasuring ? "destructive" : "default"}
								>
									{isMeasuring ? "Stop Measuring" : "Start Measuring"}
								</Button>
							) : null}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
