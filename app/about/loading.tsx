import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<Skeleton className="h-12 w-64 mb-4" />

				<section className="mb-12">
					<Skeleton className="h-4 w-full mb-2" />
					<Skeleton className="h-4 w-[90%] mb-2" />
					<Skeleton className="h-4 w-[95%]" />
				</section>

				<section className="mb-12">
					<Skeleton className="h-8 w-48 mb-6" />
					<div className="grid gap-6 md:grid-cols-2">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Card key={i}>
								<CardHeader className="flex flex-row items-center gap-4">
									<Skeleton className="h-8 w-8" />
									<Skeleton className="h-6 w-32" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-4 w-full mb-2" />
									<Skeleton className="h-4 w-[90%]" />
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section className="mb-12">
					<Skeleton className="h-8 w-48 mb-6" />
					<Card>
						<CardContent className="p-6">
							<div className="space-y-6">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="space-y-2">
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-[95%]" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</section>

				<section>
					<Skeleton className="h-8 w-48 mb-6" />
					<Card>
						<CardContent className="p-6">
							<div className="space-y-6">
								{[1, 2, 3].map((i) => (
									<div key={i} className="flex items-start gap-4">
										<Skeleton className="h-6 w-6 flex-shrink-0" />
										<div className="space-y-2 flex-1">
											<Skeleton className="h-6 w-32" />
											<Skeleton className="h-4 w-full" />
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</section>
			</div>
		</div>
	);
}
