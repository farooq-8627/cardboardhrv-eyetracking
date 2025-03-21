import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MonitorLoading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<Skeleton className="h-10 w-48 mb-8" />

				<div className="grid gap-8">
					{/* Connection Section Loading State */}
					<section className="bg-card rounded-lg p-6 border">
						<Skeleton className="h-6 w-36 mb-4" />
						<div className="space-y-4">
							<Skeleton className="h-4 w-full max-w-md" />
							<Skeleton className="h-[256px] w-[256px] mx-auto" />
						</div>
					</section>

					{/* Live Monitor Section Loading State */}
					<section className="bg-card rounded-lg p-6 border">
						<Skeleton className="h-6 w-36 mb-4" />
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Card>
									<CardHeader>
										<Skeleton className="h-4 w-24" />
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<Skeleton className="h-8 w-20" />
											<Skeleton className="h-4 w-32" />
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<Skeleton className="h-4 w-24" />
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 gap-2">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-20" />
										</div>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<Skeleton className="h-4 w-32" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-[300px] w-full" />
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
