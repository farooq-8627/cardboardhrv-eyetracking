"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, LineChart, Maximize2, Video } from "lucide-react";
import { EyeTrackingAnalytics } from "@/components/eye-tracking/EyeTrackingAnalytics";
import { EyeTrackingVideo } from "@/components/eye-tracking/EyeTrackingVideo";
import { useConnectionStore } from "@/stores/connectionStore";

interface PupilData {
	timestamp: number;
	diameter: number;
	position: { x: number; y: number };
}

export default function EyeTrackingPage() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const { remoteStream } = useConnectionStore();
	const [pupilData, setPupilData] = useState<PupilData[]>([]);
	const [currentPupilSize, setCurrentPupilSize] = useState<number>(0);

	// Handle remote video stream
	useEffect(() => {
		if (videoRef.current && remoteStream) {
			videoRef.current.srcObject = remoteStream;
		}
	}, [remoteStream]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid gap-8 md:grid-cols-2">
				<div className="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Video className="text-blue-500" />
								Eye Tracking Feed
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative aspect-video bg-black rounded-lg overflow-hidden">
								<EyeTrackingVideo
									videoRef={videoRef}
									onPupilData={(data) => {
										setPupilData((prev) => [...prev.slice(-100), data]);
										setCurrentPupilSize(data.diameter);
									}}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Eye className="text-green-500" />
								Current Pupil Metrics
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground">
										Pupil Diameter
									</p>
									<p className="text-2xl font-bold">
										{currentPupilSize.toFixed(1)} px
									</p>
								</div>
								<div className="p-4 bg-secondary rounded-lg">
									<p className="text-sm text-muted-foreground">
										Tracking Status
									</p>
									<p className="text-2xl font-bold text-green-500">Active</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<LineChart className="text-purple-500" />
								Pupil Size Analytics
							</CardTitle>
						</CardHeader>
						<CardContent className="h-[400px]">
							<EyeTrackingAnalytics data={pupilData} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Maximize2 className="text-orange-500" />
								Gaze Position Heatmap
							</CardTitle>
						</CardHeader>
						<CardContent className="h-[300px]">
							{/* Add heatmap visualization here */}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
