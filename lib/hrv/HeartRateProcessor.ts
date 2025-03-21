"use client";

export class HeartRateProcessor {
	private readonly SAMPLE_RATE = 30; // 30 fps
	private readonly WINDOW_SIZE = 300; // 10 seconds at 30 fps
	private readonly MIN_PEAK_DISTANCE = 15; // Minimum distance between peaks (0.5s at 30 fps)
	private readonly PEAK_THRESHOLD = 0.6; // Relative threshold for peak detection

	private buffer: number[] = [];
	private peaks: number[] = [];
	private lastPeakIndex = -1;
	private baseline = 0;
	private maxValue = 0;

	processPPGFrame(frame: ImageData): number {
		// Extract red channel average (PPG signal)
		const redChannel = this.extractRedChannel(frame);
		this.updateBuffer(redChannel);

		// Detect peaks in the signal
		const peakIndex = this.detectPeak();
		if (peakIndex !== -1) {
			this.peaks.push(peakIndex);
			this.lastPeakIndex = peakIndex;

			// Keep only peaks within the window
			this.peaks = this.peaks.filter(
				(p) => p > this.buffer.length - this.WINDOW_SIZE
			);
		}

		return this.calculateHeartRate();
	}

	private extractRedChannel(frame: ImageData): number {
		let sum = 0;
		let count = 0;

		// Sample every 4th pixel for performance
		for (let i = 0; i < frame.data.length; i += 16) {
			sum += frame.data[i]; // Red channel
			count++;
		}

		return sum / count;
	}

	private updateBuffer(value: number) {
		this.buffer.push(value);

		if (this.buffer.length > this.WINDOW_SIZE) {
			this.buffer.shift();
		}

		// Update baseline and max value
		if (this.buffer.length === this.WINDOW_SIZE) {
			const sorted = [...this.buffer].sort((a, b) => a - b);
			this.baseline = sorted[Math.floor(this.WINDOW_SIZE * 0.1)]; // 10th percentile
			this.maxValue = sorted[Math.floor(this.WINDOW_SIZE * 0.9)]; // 90th percentile
		}
	}

	private detectPeak(): number {
		if (this.buffer.length < 3) return -1;

		const lastIndex = this.buffer.length - 1;
		const current = this.buffer[lastIndex];
		const previous = this.buffer[lastIndex - 1];
		const next = this.buffer[lastIndex - 2];

		// Check if enough time has passed since last peak
		if (
			this.lastPeakIndex !== -1 &&
			lastIndex - this.lastPeakIndex < this.MIN_PEAK_DISTANCE
		) {
			return -1;
		}

		// Calculate adaptive threshold
		const threshold =
			this.baseline + (this.maxValue - this.baseline) * this.PEAK_THRESHOLD;

		// Peak detection with threshold
		if (current > threshold && current > previous && current > next) {
			return lastIndex;
		}

		return -1;
	}

	private calculateHeartRate(): number {
		if (this.peaks.length < 2) return 0;

		// Calculate intervals between peaks
		const intervals = [];
		for (let i = 1; i < this.peaks.length; i++) {
			intervals.push(this.peaks[i] - this.peaks[i - 1]);
		}

		// Remove outliers (intervals that are too short or too long)
		const validIntervals = this.removeOutliers(intervals);
		if (validIntervals.length === 0) return 0;

		// Calculate average interval and convert to heart rate
		const averageInterval =
			validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
		const heartRate = (60 * this.SAMPLE_RATE) / averageInterval;

		return Math.round(heartRate);
	}

	private removeOutliers(intervals: number[]): number[] {
		if (intervals.length < 3) return intervals;

		// Calculate quartiles
		const sorted = [...intervals].sort((a, b) => a - b);
		const q1 = sorted[Math.floor(intervals.length * 0.25)];
		const q3 = sorted[Math.floor(intervals.length * 0.75)];
		const iqr = q3 - q1;

		// Filter out values outside 1.5 * IQR
		return intervals.filter((x) => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr);
	}

	getRRIntervals(): number[] {
		if (this.peaks.length < 2) return [];

		const intervals = [];
		for (let i = 1; i < this.peaks.length; i++) {
			const interval =
				((this.peaks[i] - this.peaks[i - 1]) / this.SAMPLE_RATE) * 1000; // Convert to milliseconds
			intervals.push(interval);
		}

		return this.removeOutliers(intervals);
	}

	reset() {
		this.buffer = [];
		this.peaks = [];
		this.lastPeakIndex = -1;
		this.baseline = 0;
		this.maxValue = 0;
	}
}
