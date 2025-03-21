export class VideoFrameProcessor {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private processingInterval: number | null = null;
	private frameRate = 30; // frames per second

	constructor() {
		this.canvas = document.createElement("canvas");
		const ctx = this.canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get canvas context");
		}
		this.context = ctx;
	}

	/**
	 * Start processing video frames
	 * @param videoElement HTML video element to capture frames from
	 * @param onFrame Callback function to handle processed frame data
	 */
	startProcessing(
		videoElement: HTMLVideoElement,
		onFrame: (frameData: string) => void
	) {
		if (this.processingInterval) {
			this.stopProcessing();
		}

		// Set canvas dimensions to match video
		this.canvas.width = videoElement.videoWidth;
		this.canvas.height = videoElement.videoHeight;

		// Start processing frames at specified frame rate
		this.processingInterval = window.setInterval(() => {
			this.processFrame(videoElement, onFrame);
		}, 1000 / this.frameRate);
	}

	/**
	 * Stop processing video frames
	 */
	stopProcessing() {
		if (this.processingInterval) {
			clearInterval(this.processingInterval);
			this.processingInterval = null;
		}
	}

	/**
	 * Process a single video frame
	 * @param videoElement Video element to capture frame from
	 * @param onFrame Callback function to handle processed frame data
	 */
	private processFrame(
		videoElement: HTMLVideoElement,
		onFrame: (frameData: string) => void
	) {
		try {
			// Draw the current video frame to the canvas
			this.context.drawImage(videoElement, 0, 0);

			// Convert the frame to base64 data URL
			const frameData = this.canvas.toDataURL("image/jpeg", 0.7);

			// Call the callback with the processed frame data
			onFrame(frameData);
		} catch (error) {
			console.error("Error processing video frame:", error);
		}
	}

	/**
	 * Set the frame rate for processing
	 * @param fps Frames per second (1-60)
	 */
	setFrameRate(fps: number) {
		this.frameRate = Math.min(Math.max(fps, 1), 60);
		if (this.processingInterval) {
			this.stopProcessing();
			this.startProcessing(
				document.querySelector("video") as HTMLVideoElement,
				() => {}
			);
		}
	}

	/**
	 * Get the current frame rate
	 */
	getFrameRate(): number {
		return this.frameRate;
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		this.stopProcessing();
		this.canvas.remove();
	}
}
