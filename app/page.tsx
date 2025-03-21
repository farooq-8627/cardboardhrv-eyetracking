import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Eye, Brain } from "lucide-react";

export default function Home() {
	const features = [
		{
			title: "Real-time HRV Monitoring",
			description:
				"Monitor heart rate variability in real-time with professional-grade accuracy using your smartphone.",
			icon: Heart,
		},
		{
			title: "Eye Tracking",
			description:
				"Track eye movements and gaze patterns with precision using advanced computer vision algorithms.",
			icon: Eye,
		},
		{
			title: "Pupil Diameter Analysis",
			description:
				"Measure and analyze pupil diameter changes in response to various stimuli.",
			icon: Brain,
		},
		{
			title: "Comprehensive Analytics",
			description:
				"Get detailed insights and analytics about your physiological measurements.",
			icon: Activity,
		},
	];

	return (
		<div className="flex flex-col min-h-[calc(100vh-4rem)]">
			{/* Hero Section */}
			<section className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
				<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text mb-6">
					CardboardHRV
				</h1>
				<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8">
					Professional-grade heart rate variability monitoring and eye tracking
					using your smartphone
				</p>
				<div className="flex flex-col sm:flex-row gap-4">
					<Button asChild size="lg">
						<Link href="/monitor">Start Monitoring</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/about">Learn More</Link>
					</Button>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-muted/50">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">Features</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{features.map((feature, index) => (
							<Card key={index} className="bg-background">
								<CardHeader>
									<feature.icon className="w-10 h-10 text-primary mb-2" />
									<CardTitle>{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Trusted By Section */}
			<section className="py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-12">Trusted By</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{[
							"Research Labs",
							"Universities",
							"Healthcare Providers",
							"Sports Teams",
						].map((org, index) => (
							<div
								key={index}
								className="flex items-center justify-center p-4 rounded-lg bg-muted"
							>
								<span className="text-muted-foreground">{org}</span>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
