import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Eye, Brain, Activity, Smartphone, Users } from "lucide-react";

export const metadata: Metadata = {
	title: "About - CardboardHRV",
	description:
		"Learn more about CardboardHRV and its innovative approach to heart rate variability monitoring.",
};

export default function AboutPage() {
	const features = [
		{
			title: "Smartphone-Based Monitoring",
			description:
				"Transform your smartphone into a professional-grade heart rate monitor using the built-in camera and flash.",
			icon: Smartphone,
		},
		{
			title: "Advanced Eye Tracking",
			description:
				"Track eye movements and pupil dilation with precision using computer vision algorithms.",
			icon: Eye,
		},
		{
			title: "Real-time HRV Analysis",
			description:
				"Calculate and visualize heart rate variability metrics in real-time for immediate feedback.",
			icon: Heart,
		},
		{
			title: "Cognitive Load Assessment",
			description:
				"Measure cognitive load through combined analysis of HRV and pupil diameter changes.",
			icon: Brain,
		},
		{
			title: "Research-Grade Data",
			description:
				"Collect high-quality physiological data suitable for academic research and clinical applications.",
			icon: Activity,
		},
		{
			title: "User-Friendly Interface",
			description:
				"Easy-to-use interface designed for both researchers and participants.",
			icon: Users,
		},
	];

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold mb-4">About CardboardHRV</h1>

				<section className="mb-12">
					<p className="text-lg text-muted-foreground mb-6">
						CardboardHRV is an innovative solution that combines smartphone
						technology with advanced signal processing to provide
						professional-grade heart rate variability monitoring and eye
						tracking capabilities. Our system is designed to make physiological
						measurements accessible and affordable for researchers, clinicians,
						and individuals interested in understanding their body's responses.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-bold mb-6">Key Features</h2>
					<div className="grid gap-6 md:grid-cols-2">
						{features.map((feature, index) => (
							<Card key={index}>
								<CardHeader className="flex flex-row items-center gap-4">
									<feature.icon className="w-8 h-8 text-primary" />
									<CardTitle className="text-xl">{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section className="mb-12">
					<h2 className="text-2xl font-bold mb-6">How It Works</h2>
					<Card>
						<CardContent className="p-6">
							<ol className="list-decimal list-inside space-y-4">
								<li className="text-lg">
									<span className="font-medium">Phone Connection:</span>
									<p className="mt-2 text-muted-foreground">
										Scan a QR code to connect your smartphone to the system.
										Your phone's camera and flash will be used to capture the
										photoplethysmogram (PPG) signal.
									</p>
								</li>
								<li className="text-lg">
									<span className="font-medium">Signal Processing:</span>
									<p className="mt-2 text-muted-foreground">
										Advanced algorithms process the PPG signal in real-time to
										extract heart rate and calculate various HRV metrics with
										high accuracy.
									</p>
								</li>
								<li className="text-lg">
									<span className="font-medium">Eye Tracking:</span>
									<p className="mt-2 text-muted-foreground">
										Simultaneously track eye movements and pupil diameter
										changes using the front-facing camera, providing insights
										into attention and cognitive load.
									</p>
								</li>
								<li className="text-lg">
									<span className="font-medium">Data Analysis:</span>
									<p className="mt-2 text-muted-foreground">
										View real-time visualizations and receive instant feedback
										on your physiological state, with options to export data for
										further analysis.
									</p>
								</li>
							</ol>
						</CardContent>
					</Card>
				</section>

				<section>
					<h2 className="text-2xl font-bold mb-6">Applications</h2>
					<Card>
						<CardContent className="p-6">
							<ul className="space-y-4">
								<li className="flex items-start gap-4">
									<div className="w-6 h-6 mt-1 flex-shrink-0">
										<Brain className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="font-medium">Research</h3>
										<p className="text-muted-foreground">
											Conduct studies on stress, cognitive load, attention, and
											physiological responses.
										</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-6 h-6 mt-1 flex-shrink-0">
										<Activity className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="font-medium">Clinical Assessment</h3>
										<p className="text-muted-foreground">
											Monitor patient responses during therapeutic interventions
											or assessments.
										</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-6 h-6 mt-1 flex-shrink-0">
										<Users className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="font-medium">Education</h3>
										<p className="text-muted-foreground">
											Study student engagement and cognitive load during
											learning activities.
										</p>
									</div>
								</li>
							</ul>
						</CardContent>
					</Card>
				</section>
			</div>
		</div>
	);
}
