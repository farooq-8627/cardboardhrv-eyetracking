import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Monitor - CardboardHRV",
	description:
		"Connect your phone and start monitoring heart rate variability in real-time.",
};

export default function MonitorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
