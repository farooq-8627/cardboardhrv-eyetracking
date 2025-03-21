"use client";

import { useEffect, useRef } from "react";
import { QRConnect } from "@/components/connection/QRConnect";
import { useConnectionStore } from "@/stores/connectionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Heart } from "lucide-react";

export default function MonitorPage() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const { remoteStream, heartRate, heartRateHistory } = useConnectionStore();

	// Handle remote video stream
	useEffect(() => {
		if (videoRef.current && remoteStream) {
			videoRef.current.srcObject = remoteStream;
		}
	}, [remoteStream]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid gap-8 md:grid-cols-2">
				<QRConnect />

				<div className="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Camera className="text-blue-500" />
								Remote Camera Feed
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative aspect-video bg-black rounded-lg overflow-hidden">
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className="absolute inset-0 w-full h-full object-cover"
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Heart className="text-red-500" />
								Heart Rate Monitor
							</CardTitle>
						</CardHeader>
						<CardContent>
							{heartRate ? (
								<div className="text-center">
									<p className="text-4xl font-bold">{heartRate} BPM</p>
									<p className="text-sm text-muted-foreground mt-2">
										Heart rate data is being received from your phone
									</p>
									<div className="mt-4 h-32 border rounded-lg p-2">
										<div className="h-full flex items-end">
											{heartRateHistory.map((item, index) => (
												<div
													key={item.timestamp}
													className="flex-1 bg-red-500"
													style={{
														height: `${(item.value / 200) * 100}%`,
														opacity: (index + 1) / heartRateHistory.length,
													}}
												/>
											))}
										</div>
									</div>
								</div>
							) : (
								<p className="text-center text-muted-foreground">
									Waiting for heart rate data...
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
