"use client";

import { useEffect, useRef } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface PupilData {
	timestamp: number;
	diameter: number;
	position: { x: number; y: number };
}

interface EyeTrackingAnalyticsProps {
	data: PupilData[];
}

export function EyeTrackingAnalytics({ data }: EyeTrackingAnalyticsProps) {
	const { theme } = useTheme();
	const chartRef = useRef<any>(null);

	const chartData: ChartData<"line"> = {
		labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
		datasets: [
			{
				label: "Pupil Diameter",
				data: data.map((d) => d.diameter),
				borderColor: theme === "dark" ? "#22c55e" : "#16a34a",
				backgroundColor: theme === "dark" ? "#22c55e50" : "#16a34a50",
				fill: true,
				tension: 0.4,
				pointRadius: 0,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		animation: {
			duration: 0,
		},
		scales: {
			x: {
				display: true,
				grid: {
					display: false,
				},
				ticks: {
					maxTicksLimit: 5,
					color: theme === "dark" ? "#94a3b8" : "#64748b",
				},
			},
			y: {
				display: true,
				grid: {
					color: theme === "dark" ? "#1f2937" : "#e2e8f0",
				},
				ticks: {
					color: theme === "dark" ? "#94a3b8" : "#64748b",
				},
				min: 0,
				max: Math.max(...data.map((d) => d.diameter), 100) + 20,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: false,
			},
		},
	};

	// Update chart theme when theme changes
	useEffect(() => {
		if (chartRef.current) {
			chartRef.current.update();
		}
	}, [theme]);

	return (
		<div className="w-full h-full">
			<Line ref={chartRef} data={chartData} options={options} />
		</div>
	);
}
