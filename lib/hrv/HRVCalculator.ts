"use client";

export interface HRVMetrics {
	sdnn: number;
	rmssd: number;
	pnn50: number;
	lf: number;
	hf: number;
	lfhfRatio: number;
}

export class HRVCalculator {
	private readonly LF_MIN = 0.04;
	private readonly LF_MAX = 0.15;
	private readonly HF_MIN = 0.15;
	private readonly HF_MAX = 0.4;

	calculateMetrics(rrIntervals: number[]): HRVMetrics {
		if (rrIntervals.length < 2) {
			return {
				sdnn: 0,
				rmssd: 0,
				pnn50: 0,
				lf: 0,
				hf: 0,
				lfhfRatio: 0,
			};
		}

		return {
			sdnn: this.calculateSDNN(rrIntervals),
			rmssd: this.calculateRMSSD(rrIntervals),
			pnn50: this.calculatePNN50(rrIntervals),
			lf: this.calculateLF(rrIntervals),
			hf: this.calculateHF(rrIntervals),
			lfhfRatio: this.calculateLFHFRatio(rrIntervals),
		};
	}

	private calculateSDNN(rrIntervals: number[]): number {
		const mean = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
		const squaredDiffs = rrIntervals.map((rr) => Math.pow(rr - mean, 2));
		return Math.sqrt(
			squaredDiffs.reduce((a, b) => a + b, 0) / rrIntervals.length
		);
	}

	private calculateRMSSD(rrIntervals: number[]): number {
		const differences = [];
		for (let i = 1; i < rrIntervals.length; i++) {
			differences.push(Math.pow(rrIntervals[i] - rrIntervals[i - 1], 2));
		}
		return Math.sqrt(
			differences.reduce((a, b) => a + b, 0) / differences.length
		);
	}

	private calculatePNN50(rrIntervals: number[]): number {
		let nn50Count = 0;
		for (let i = 1; i < rrIntervals.length; i++) {
			if (Math.abs(rrIntervals[i] - rrIntervals[i - 1]) > 50) {
				nn50Count++;
			}
		}
		return (nn50Count / (rrIntervals.length - 1)) * 100;
	}

	private calculateLF(rrIntervals: number[]): number {
		return this.calculatePowerInBand(rrIntervals, this.LF_MIN, this.LF_MAX);
	}

	private calculateHF(rrIntervals: number[]): number {
		return this.calculatePowerInBand(rrIntervals, this.HF_MIN, this.HF_MAX);
	}

	private calculateLFHFRatio(rrIntervals: number[]): number {
		const lf = this.calculateLF(rrIntervals);
		const hf = this.calculateHF(rrIntervals);
		return hf === 0 ? 0 : lf / hf;
	}

	private calculatePowerInBand(
		rrIntervals: number[],
		fMin: number,
		fMax: number
	): number {
		// Convert RR intervals to frequency domain using FFT
		const frequencies = this.calculateFrequencies(rrIntervals);
		const powers = this.calculatePowerSpectrum(rrIntervals);

		// Sum power in the specified frequency band
		let power = 0;
		for (let i = 0; i < frequencies.length; i++) {
			if (frequencies[i] >= fMin && frequencies[i] <= fMax) {
				power += powers[i];
			}
		}

		return power;
	}

	private calculateFrequencies(rrIntervals: number[]): number[] {
		const n = rrIntervals.length;
		const samplingRate = 1000 / (rrIntervals.reduce((a, b) => a + b, 0) / n); // Average sampling rate
		return Array.from({ length: n }, (_, i) => (i * samplingRate) / (2 * n));
	}

	private calculatePowerSpectrum(rrIntervals: number[]): number[] {
		// Detrend the signal
		const detrended = this.detrend(rrIntervals);

		// Apply Hanning window
		const windowed = this.applyWindow(detrended);

		// Perform FFT
		const fft = this.fft(windowed);

		// Calculate power spectrum
		return fft.map((x) => Math.pow(Math.abs(x), 2));
	}

	private detrend(signal: number[]): number[] {
		const n = signal.length;
		const x = Array.from({ length: n }, (_, i) => i);

		// Calculate linear regression
		const sumX = x.reduce((a, b) => a + b, 0);
		const sumY = signal.reduce((a, b) => a + b, 0);
		const sumXY = x.reduce((a, i) => a + i * signal[i], 0);
		const sumX2 = x.reduce((a, b) => a + b * b, 0);

		const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
		const intercept = (sumY - slope * sumX) / n;

		// Remove trend
		return signal.map((y, i) => y - (slope * i + intercept));
	}

	private applyWindow(signal: number[]): number[] {
		return signal.map((x, i) => {
			const hann =
				0.5 * (1 - Math.cos((2 * Math.PI * i) / (signal.length - 1)));
			return x * hann;
		});
	}

	private fft(signal: number[]): number[] {
		const n = signal.length;

		if (n === 1) {
			return signal;
		}

		const even = signal.filter((_, i) => i % 2 === 0);
		const odd = signal.filter((_, i) => i % 2 === 1);

		const evenFFT = this.fft(even);
		const oddFFT = this.fft(odd);

		const result = new Array(n);
		for (let k = 0; k < n / 2; k++) {
			const t = oddFFT[k] * Math.exp((-2 * Math.PI * k * Math.I) / n);
			result[k] = evenFFT[k] + t;
			result[k + n / 2] = evenFFT[k] - t;
		}

		return result;
	}
}
