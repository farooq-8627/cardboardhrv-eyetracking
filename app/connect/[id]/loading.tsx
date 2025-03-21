import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConnectLoading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-md mx-auto space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-5" />
							<Skeleton className="h-5 w-32" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="aspect-video bg-muted rounded-lg">
								<Skeleton className="w-full h-full" />
							</div>

							<Skeleton className="h-10 w-full" />

							<div className="grid grid-cols-2 gap-4">
								<div className="text-center p-4 bg-muted rounded-lg">
									<Skeleton className="h-4 w-24 mx-auto mb-2" />
									<Skeleton className="h-8 w-16 mx-auto mb-1" />
									<Skeleton className="h-3 w-8 mx-auto" />
								</div>
								<div className="text-center p-4 bg-muted rounded-lg">
									<Skeleton className="h-4 w-24 mx-auto mb-2" />
									<Skeleton className="h-8 w-16 mx-auto" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex justify-center">
							<Skeleton className="h-4 w-3/4" />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
