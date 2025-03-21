import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
			<p className="text-lg text-muted-foreground">Loading...</p>
		</div>
	);
}
