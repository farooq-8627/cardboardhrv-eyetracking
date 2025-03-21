"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRConnect } from "@/components/connection/QRConnect";
import { useConnectionStore } from "@/stores/connectionStore";
import { Smartphone, Wifi, CheckCircle2 } from "lucide-react";

export default function ConnectPhonePage() {
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const { connectionStatus } = useConnectionStore();

	const steps = [
		{
			title: "Get Started",
			description:
				"Follow these steps to connect your phone for heart rate monitoring",
			icon: Smartphone,
		},
		{
			title: "Scan QR Code",
			description: "Use your phone's camera to scan the QR code",
			icon: Wifi,
		},
		{
			title: "Connection Complete",
			description:
				"Your phone is now connected and ready to monitor heart rate",
			icon: CheckCircle2,
		},
	];

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-2">Connect Your Phone</h1>
					<p className="text-muted-foreground">
						Use your phone's camera to measure your heart rate
					</p>
				</div>

				{/* Progress Steps */}
				<div className="flex justify-between items-center mb-8">
					{steps.map((s, i) => (
						<div key={i} className="flex flex-col items-center w-1/3">
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                ${
									i + 1 === step
										? "bg-primary text-primary-foreground"
										: i + 1 < step
											? "bg-green-500 text-white"
											: "bg-muted text-muted-foreground"
								}`}
							>
								{i + 1 < step ? (
									<CheckCircle2 className="w-6 h-6" />
								) : (
									<s.icon className="w-6 h-6" />
								)}
							</div>
							<div className="text-center">
								<div className="text-sm font-medium">{s.title}</div>
								<div className="text-xs text-muted-foreground hidden md:block">
									{s.description}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Step Content */}
				<Card>
					<CardHeader>
						<CardTitle>{steps[step - 1].title}</CardTitle>
						<CardDescription>{steps[step - 1].description}</CardDescription>
					</CardHeader>
					<CardContent>
						{step === 1 && (
							<div className="space-y-4">
								<div className="bg-muted p-4 rounded-lg space-y-2">
									<p className="font-medium">Before you begin:</p>
									<ul className="list-disc list-inside space-y-1 text-sm">
										<li>Ensure your phone has a camera</li>
										<li>Enable camera permissions when prompted</li>
										<li>Make sure both devices are on the same network</li>
									</ul>
								</div>
								<Button className="w-full" onClick={() => setStep(2)}>
									Continue to QR Code
								</Button>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-4">
								<QRConnect />
								{connectionStatus === "connected" && (
									<Button className="w-full" onClick={() => setStep(3)}>
										Continue
									</Button>
								)}
							</div>
						)}

						{step === 3 && (
							<div className="text-center space-y-4">
								<div className="flex justify-center">
									<CheckCircle2 className="w-16 h-16 text-green-500" />
								</div>
								<div>
									<p className="text-lg font-medium">Connection Successful!</p>
									<p className="text-sm text-muted-foreground">
										Your phone is now connected and ready to monitor your heart
										rate.
									</p>
								</div>
								<Button
									className="w-full"
									onClick={() => (window.location.href = "/monitor")}
								>
									Go to Monitor
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
