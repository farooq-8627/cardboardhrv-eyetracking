"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface EyeTrackingVideoProps {
	videoRef: React.RefObject<HTMLVideoElement>;
	onPupilData: (data: {
		timestamp: number;
		diameter: number;
		position: { x: number; y: number };
	}) => void;
}

export function EyeTrackingVideo({
	videoRef,
	onPupilData,
}: EyeTrackingVideoProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const overlayRef = useRef<HTMLCanvasElement>(null);
	const { theme } = useTheme();

	useEffect(() => {
		if (!videoRef.current || !canvasRef.current || !overlayRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const overlay = overlayRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		const overlayCtx = overlay.getContext("2d");

		if (!ctx || !overlayCtx) return;

		let animationFrame: number;
		let isTracking = false;

		const processFrame = () => {
			if (!video.videoWidth) {
				animationFrame = requestAnimationFrame(processFrame);
				return;
			}

			// Set canvas sizes
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			overlay.width = video.videoWidth;
			overlay.height = video.videoHeight;

			// Draw video frame to canvas
			ctx.drawImage(video, 0, 0);

			// Get image data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const { data, width, height } = imageData;

			// Clear overlay
			overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

			// Find pupil (dark area)
			let minX = width;
			let maxX = 0;
			let minY = height;
			let maxY = 0;
			let darkPixels = 0;

			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const i = (y * width + x) * 4;
					const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

					if (brightness < 50) {
						// Threshold for dark pixels
						darkPixels++;
						minX = Math.min(minX, x);
						maxX = Math.max(maxX, x);
						minY = Math.min(minY, y);
						maxY = Math.max(maxY, y);
					}
				}
			}

			// Calculate pupil metrics
			const pupilX = (minX + maxX) / 2;
			const pupilY = (minY + maxY) / 2;
			const pupilDiameter = Math.max(maxX - minX, maxY - minY);

			// Draw pupil overlay
			if (darkPixels > 100) {
				// Minimum dark pixels to consider it a pupil
				isTracking = true;
				overlayCtx.strokeStyle = theme === "dark" ? "#22c55e" : "#16a34a";
				overlayCtx.lineWidth = 2;
				overlayCtx.beginPath();
				overlayCtx.arc(pupilX, pupilY, pupilDiameter / 2, 0, Math.PI * 2);
				overlayCtx.stroke();

				// Draw crosshair
				overlayCtx.beginPath();
				overlayCtx.moveTo(pupilX - 10, pupilY);
				overlayCtx.lineTo(pupilX + 10, pupilY);
				overlayCtx.moveTo(pupilX, pupilY - 10);
				overlayCtx.lineTo(pupilX, pupilY + 10);
				overlayCtx.stroke();

				// Display pupil size
				overlayCtx.font = "24px Arial";
				overlayCtx.fillStyle = theme === "dark" ? "#22c55e" : "#16a34a";
				overlayCtx.fillText(
					`Pupil Size: ${Math.round(pupilDiameter)} px`,
					20,
					40
				);

				// Send pupil data
				onPupilData({
					timestamp: Date.now(),
					diameter: pupilDiameter,
					position: { x: pupilX, y: pupilY },
				});
			} else {
				isTracking = false;
			}

			animationFrame = requestAnimationFrame(processFrame);
		};

		video.addEventListener("play", () => {
			animationFrame = requestAnimationFrame(processFrame);
		});

		return () => {
			cancelAnimationFrame(animationFrame);
		};
	}, [videoRef, onPupilData, theme]);

	return (
		<>
			<canvas ref={canvasRef} className="hidden" />
			<canvas
				ref={overlayRef}
				className="absolute inset-0 w-full h-full pointer-events-none"
			/>
		</>
	);
}
