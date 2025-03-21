"use client";

import { createClient } from "@supabase/supabase-js";

export interface AIAnalysis {
	insights: string[];
	recommendations: string[];
	anomalies: AnomalyDetection[];
}

export interface AnomalyDetection {
	timestamp: number;
	type: string;
	severity: "low" | "medium" | "high";
	description: string;
}

export interface SessionData {
	id: string;
	start_time: string;
	end_time: string;
	heart_rate_data: {
		timestamp: number;
		heart_rate: number;
		rr_interval: number;
		signal_quality: number;
	}[];
	hrv_metrics: {
		timestamp: number;
		sdnn: number;
		rmssd: number;
		pnn50: number;
		lf: number;
		hf: number;
		lfhf_ratio: number;
	}[];
}

export class LLMService {
	private supabase;

	constructor() {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseKey) {
			throw new Error("Missing Supabase configuration");
		}

		this.supabase = createClient(supabaseUrl, supabaseKey);
	}

	async analyzeSession(sessionId: string): Promise<AIAnalysis> {
		try {
			// Fetch session data
			const { data: sessionData, error } = await this.supabase
				.from("sessions")
				.select(
					`
          *,
          heart_rate_data (
            timestamp,
            heart_rate,
            rr_interval,
            signal_quality
          ),
          hrv_metrics (
            timestamp,
            sdnn,
            rmssd,
            pnn50,
            lf,
            hf,
            lfhf_ratio
          )
        `
				)
				.eq("id", sessionId)
				.single();

			if (error) throw error;

			// Generate analysis
			const analysis = await this.generateAnalysis(sessionData);

			// Store analysis results
			await this.supabase.from("ai_analysis").insert([
				{
					session_id: sessionId,
					results: analysis,
					timestamp: new Date().toISOString(),
					model: "gpt-4",
				},
			]);

			return analysis;
		} catch (error) {
			console.error("Error analyzing session:", error);
			throw error;
		}
	}

	private async generateAnalysis(
		sessionData: SessionData
	): Promise<AIAnalysis> {
		const analysis: AIAnalysis = {
			insights: [],
			recommendations: [],
			anomalies: [],
		};

		// Basic statistical analysis
		const hrvMetrics = sessionData.hrv_metrics;
		const heartRateData = sessionData.heart_rate_data;

		if (hrvMetrics.length === 0 || heartRateData.length === 0) {
			return analysis;
		}

		// Analyze HRV metrics trends
		this.analyzeHRVTrends(analysis, hrvMetrics);

		// Detect anomalies in heart rate
		this.detectHeartRateAnomalies(analysis, heartRateData);

		// Generate recommendations based on analysis
		this.generateRecommendations(analysis, hrvMetrics);

		return analysis;
	}

	private analyzeHRVTrends(
		analysis: AIAnalysis,
		hrvMetrics: SessionData["hrv_metrics"]
	) {
		// Calculate average metrics
		const avgSDNN = this.calculateAverage(hrvMetrics.map((m) => m.sdnn));
		const avgRMSSD = this.calculateAverage(hrvMetrics.map((m) => m.rmssd));
		const avgLFHF = this.calculateAverage(hrvMetrics.map((m) => m.lfhf_ratio));

		// Add insights based on HRV metrics
		if (avgSDNN < 50) {
			analysis.insights.push(
				"Lower SDNN indicates reduced overall heart rate variability"
			);
		} else if (avgSDNN > 100) {
			analysis.insights.push(
				"Higher SDNN suggests good overall heart rate variability"
			);
		}

		if (avgRMSSD < 20) {
			analysis.insights.push(
				"Low RMSSD indicates reduced parasympathetic activity"
			);
		} else if (avgRMSSD > 50) {
			analysis.insights.push("High RMSSD suggests good parasympathetic tone");
		}

		if (avgLFHF < 1) {
			analysis.insights.push(
				"Low LF/HF ratio indicates parasympathetic dominance"
			);
		} else if (avgLFHF > 2) {
			analysis.insights.push("High LF/HF ratio suggests sympathetic dominance");
		}
	}

	private detectHeartRateAnomalies(
		analysis: AIAnalysis,
		heartRateData: SessionData["heart_rate_data"]
	) {
		const heartRates = heartRateData.map((d) => d.heart_rate);
		const mean = this.calculateAverage(heartRates);
		const stdDev = this.calculateStdDev(heartRates, mean);

		// Detect significant deviations
		heartRateData.forEach((data) => {
			const deviation = Math.abs(data.heart_rate - mean);
			if (deviation > 2 * stdDev) {
				analysis.anomalies.push({
					timestamp: data.timestamp,
					type: "heart_rate_deviation",
					severity: deviation > 3 * stdDev ? "high" : "medium",
					description: `Heart rate of ${data.heart_rate} BPM deviates significantly from the mean of ${mean.toFixed(1)} BPM`,
				});
			}
		});
	}

	private generateRecommendations(
		analysis: AIAnalysis,
		hrvMetrics: SessionData["hrv_metrics"]
	) {
		const lastMetrics = hrvMetrics[hrvMetrics.length - 1];

		if (lastMetrics.sdnn < 50) {
			analysis.recommendations.push(
				"Consider incorporating regular aerobic exercise to improve overall HRV",
				"Practice deep breathing exercises to enhance vagal tone"
			);
		}

		if (lastMetrics.lfhf_ratio > 2) {
			analysis.recommendations.push(
				"Focus on stress reduction techniques",
				"Consider mindfulness or meditation practices"
			);
		}

		if (lastMetrics.pnn50 < 20) {
			analysis.recommendations.push(
				"Improve sleep quality and duration",
				"Review and optimize daily routines for better recovery"
			);
		}
	}

	private calculateAverage(values: number[]): number {
		return values.reduce((a, b) => a + b, 0) / values.length;
	}

	private calculateStdDev(values: number[], mean: number): number {
		const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
		return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
	}
}
