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
	ChartData,
	ChartOptions,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart } from "lucide-react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface HeartRateData {
	timestamp: number;
	heartRate: number;
	rrInterval: number;
	signalQuality: number;
}

interface HRVMetrics {
	sdnn: number;
	rmssd: number;
	pnn50: number;
	lf: number;
	hf: number;
	lfhfRatio: number;
}

interface LiveMonitorProps {
	sessionId?: string;
}

export function LiveMonitor({ sessionId }: LiveMonitorProps) {
	const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
	const [hrvMetrics, setHRVMetrics] = useState<HRVMetrics>({
		sdnn: 0,
		rmssd: 0,
		pnn50: 0,
		lf: 0,
		hf: 0,
		lfhfRatio: 0,
	});

	useEffect(() => {
		if (!sessionId) return;

		// Connect to WebSocket for real-time updates
		const ws = new WebSocket(
			`${process.env.NEXT_PUBLIC_WS_URL}/monitor/${sessionId}`
		);

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "heartRate") {
				setHeartRateData((prev) => [...prev, data.data].slice(-30)); // Keep last 30 points
			} else if (data.type === "hrvMetrics") {
				setHRVMetrics(data.data);
			}
		};

		return () => {
			ws.close();
		};
	}, [sessionId]);

	const chartData: ChartData<"line"> = {
		labels: heartRateData.map((d) =>
			new Date(d.timestamp).toLocaleTimeString()
		),
		datasets: [
			{
				label: "Heart Rate",
				data: heartRateData.map((d) => d.heartRate),
				borderColor: "rgb(234, 88, 12)",
				backgroundColor: "rgba(234, 88, 12, 0.5)",
				tension: 0.3,
			},
		],
	};

	const chartOptions: ChartOptions<"line"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: false,
			},
		},
		scales: {
			y: {
				beginAtZero: false,
				min: 40,
				max: 120,
			},
		},
	};

	const getSignalQualityColor = (quality: number) => {
		if (quality >= 0.8) return "bg-green-500";
		if (quality >= 0.5) return "bg-yellow-500";
		return "bg-red-500";
	};

	const lastHeartRate = heartRateData[heartRateData.length - 1]?.heartRate || 0;
	const signalQuality =
		heartRateData[heartRateData.length - 1]?.signalQuality || 0;

	return (
		<div className="space-y-6">
			{/* Heart Rate Display */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
						<Heart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline space-x-2">
							<div className="text-2xl font-bold">{lastHeartRate}</div>
							<div className="text-sm text-muted-foreground">BPM</div>
						</div>
						<Badge
							variant="outline"
							className={`mt-2 ${getSignalQualityColor(signalQuality)}`}
						>
							Signal Quality: {Math.round(signalQuality * 100)}%
						</Badge>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">HRV Metrics</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>SDNN: {hrvMetrics.sdnn.toFixed(1)} ms</div>
							<div>RMSSD: {hrvMetrics.rmssd.toFixed(1)} ms</div>
							<div>pNN50: {hrvMetrics.pnn50.toFixed(1)}%</div>
							<div>LF/HF: {hrvMetrics.lfhfRatio.toFixed(2)}</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Heart Rate Chart */}
			<Card>
				<CardHeader>
					<CardTitle>Heart Rate Trend</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[300px]">
						<Line data={chartData} options={chartOptions} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
