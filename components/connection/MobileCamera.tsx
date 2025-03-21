"use client";

import { useEffect, useRef, useState } from "react";
import { ConnectionService } from "@/services/ConnectionService";

export const MobileCamera = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [heartRate, setHeartRate] = useState<number>(0);
	const connectionService = useRef<ConnectionService | null>(null);

	useEffect(() => {
		const initializeCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: "environment",
						width: { ideal: 1280 },
						height: { ideal: 720 },
					},
				});

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}

				// Initialize connection service
				connectionService.current = new ConnectionService({
					iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
					onConnected: () => setIsProcessing(true),
					onDisconnected: () => setIsProcessing(false),
				});

				await connectionService.current.addStream(stream);
				startProcessing();
			} catch (error) {
				console.error("Error accessing camera:", error);
			}
		};

		initializeCamera();

		return () => {
			connectionService.current?.disconnect();
		};
	}, []);

	const startProcessing = () => {
		if (!canvasRef.current || !videoRef.current) return;

		const context = canvasRef.current.getContext("2d");
		if (!context) return;

		const processFrame = () => {
			if (!isProcessing) return;

			context.drawImage(
				videoRef.current!,
				0,
				0,
				canvasRef.current!.width,
				canvasRef.current!.height
			);

			const frame = context.getImageData(
				0,
				0,
				canvasRef.current!.width,
				canvasRef.current!.height
			);

			// Process frame and extract red channel data
			const redChannelData = processRedChannel(frame);

			// Send data through WebRTC
			connectionService.current?.sendData({
				timestamp: Date.now(),
				data: redChannelData,
			});

			requestAnimationFrame(processFrame);
		};

		requestAnimationFrame(processFrame);
	};

	const processRedChannel = (frame: ImageData): number => {
		let sum = 0;
		for (let i = 0; i < frame.data.length; i += 4) {
			sum += frame.data[i]; // Red channel
		}
		return sum / (frame.data.length / 4);
	};

	return (
		<div className="relative w-full h-screen bg-black">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className="w-full h-full object-cover"
			/>
			<canvas ref={canvasRef} width={320} height={240} className="hidden" />
			{isProcessing && (
				<div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full flex items-center gap-2 text-white">
					<div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
					<span className="text-sm">Processing Heart Rate</span>
				</div>
			)}
		</div>
	);
};
