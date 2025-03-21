"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
			<Alert variant="destructive" className="max-w-2xl">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Something went wrong!</AlertTitle>
				<AlertDescription>
					{error.message ||
						"An unexpected error occurred. Please try again later."}
				</AlertDescription>
			</Alert>

			<div className="flex flex-col sm:flex-row gap-4">
				<Button onClick={reset} variant="default">
					Try Again
				</Button>
				<Button asChild variant="outline">
					<Link href="/">Return Home</Link>
				</Button>
			</div>

			{process.env.NODE_ENV === "development" && (
				<div className="mt-4 p-4 bg-muted rounded-lg max-w-2xl overflow-auto">
					<pre className="text-sm text-muted-foreground whitespace-pre-wrap">
						{error.stack}
					</pre>
				</div>
			)}
		</div>
	);
}
