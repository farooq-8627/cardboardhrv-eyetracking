"use client";

import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { HRVCalculator } from "@/lib/hrv/HRVCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface LiveMonitorProps {
	sessionId: string;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ sessionId }) => {
	const [heartRateData, setHeartRateData] = useState<number[]>([]);
	const [timestamps, setTimestamps] = useState<string[]>([]);
	const [currentHR, setCurrentHR] = useState<number>(0);
	const [hrvMetrics, setHRVMetrics] = useState({
		sdnn: 0,
		rmssd: 0,
		pnn50: 0,
	});

	const supabase = useSupabaseClient();
	const hrvCalculator = new HRVCalculator();
	const chartRef = useRef(null);

	useEffect(() => {
		if (!sessionId) return;

		// Create a realtime channel
		const channel = supabase
			.channel(`heart-rate-${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "heart_rate_data",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					const newData = payload.new;

					setHeartRateData((prev) => {
						const updated = [...prev, newData.heart_rate].slice(-60); // Keep last 60 seconds
						return updated;
					});

					setTimestamps((prev) => {
						const newTimestamp = new Date(
							newData.timestamp
						).toLocaleTimeString();
						return [...prev, newTimestamp].slice(-60);
					});

					setCurrentHR(newData.heart_rate);

					// Update HRV metrics every 5 seconds
					if (heartRateData.length % 5 === 0) {
						const metrics = hrvCalculator.calculateMetrics([
							newData.rr_interval,
						]);
						setHRVMetrics(metrics);
					}
				}
			)
			.subscribe();

		return () => {
			// Cleanup subscription when component unmounts or sessionId changes
			supabase.removeChannel(channel);
		};
	}, [sessionId, hrvCalculator]);

	const chartData = {
		labels: timestamps,
		datasets: [
			{
				label: "Heart Rate",
				data: heartRateData,
				borderColor: "rgb(75, 192, 192)",
				backgroundColor: "rgba(75, 192, 192, 0.1)",
				tension: 0.3,
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
				display: true,
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
				display: false,
			},
			tooltip: {
				mode: "index",
				intersect: false,
			},
		},
		animation: {
			duration: 0,
		},
	};

	return (
		<div className="space-y-6 p-6 max-w-7xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle className="text-center text-2xl">
						Current Heart Rate
					</CardTitle>
					<div className="text-center text-5xl font-bold text-primary">
						{currentHR} BPM
					</div>
				</CardHeader>
			</Card>

			<Card>
				<CardContent className="p-6">
					<div className="h-[400px]">
						<Line data={chartData} options={chartOptions} ref={chartRef} />
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-center text-sm">SDNN</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-center text-primary">
							{hrvMetrics.sdnn.toFixed(1)} ms
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-center text-sm">RMSSD</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-center text-primary">
							{hrvMetrics.rmssd.toFixed(1)} ms
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-center text-sm">pNN50</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-center text-primary">
							{hrvMetrics.pnn50.toFixed(1)}%
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
