"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ChartOptions,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HRVMetrics } from "@/lib/hrv/HRVCalculator";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface HeartRatePoint {
	timestamp: number;
	heart_rate: number;
	rr_interval: number;
	signal_quality: number;
}

interface HRVMonitorProps {
	sessionId: string;
	onError?: (error: Error) => void;
}

export function HRVMonitor({ sessionId, onError }: HRVMonitorProps) {
	const [heartRateData, setHeartRateData] = useState<HeartRatePoint[]>([]);
	const [hrvMetrics, setHRVMetrics] = useState<HRVMetrics | null>(null);

	useEffect(() => {
		// Subscribe to real-time updates
		const ws = new WebSocket(
			`${process.env.NEXT_PUBLIC_WS_URL}/ws/${sessionId}`
		);

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "heartRate") {
					setHeartRateData((current) => [...current, data.data]);
				} else if (data.type === "hrvMetrics") {
					setHRVMetrics(data.data);
				}
			} catch (error) {
				console.error("Error processing WebSocket message:", error);
				onError?.(error as Error);
			}
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
			onError?.(new Error("WebSocket connection error"));
		};

		return () => {
			ws.close();
		};
	}, [sessionId, onError]);

	const chartData = {
		labels: heartRateData.map((d) =>
			new Date(d.timestamp).toLocaleTimeString()
		),
		datasets: [
			{
				label: "Heart Rate",
				data: heartRateData.map((d) => d.heart_rate),
				borderColor: "rgb(75, 192, 192)",
				backgroundColor: "rgba(75, 192, 192, 0.1)",
				tension: 0.1,
				fill: true,
			},
		],
	};

	const chartOptions: ChartOptions<"line"> = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: false,
				min: 40,
				max: 140,
				title: {
					display: true,
					text: "BPM",
				},
			},
			x: {
				title: {
					display: true,
					text: "Time",
				},
				ticks: {
					maxTicksLimit: 10,
				},
			},
		},
		plugins: {
			legend: {
				position: "top" as const,
			},
			tooltip: {
				mode: "index" as const,
				intersect: false,
			},
		},
		animation: {
			duration: 0,
		},
	};

	return (
		<div className="space-y-4">
			<div className="h-[400px] w-full">
				<Line data={chartData} options={chartOptions} />
			</div>

			{hrvMetrics && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">
								Time Domain Metrics
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground">SDNN:</span>
									<span>{hrvMetrics.sdnn.toFixed(2)} ms</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">RMSSD:</span>
									<span>{hrvMetrics.rmssd.toFixed(2)} ms</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">pNN50:</span>
									<span>{hrvMetrics.pnn50.toFixed(2)}%</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">
								Frequency Domain Metrics
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground">LF Power:</span>
									<span>{hrvMetrics.lf.toFixed(2)} ms²</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">HF Power:</span>
									<span>{hrvMetrics.hf.toFixed(2)} ms²</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">LF/HF Ratio:</span>
									<span>{hrvMetrics.lfhfRatio.toFixed(2)}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">
								Signal Quality
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Quality:</span>
									<span>
										{heartRateData.length > 0
											? `${(heartRateData[heartRateData.length - 1].signal_quality * 100).toFixed(0)}%`
											: "N/A"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Samples:</span>
									<span>{heartRateData.length}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
