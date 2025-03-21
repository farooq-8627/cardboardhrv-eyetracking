import { NextRequest, NextResponse } from "next/server";
import {
	ref,
	push,
	query,
	orderByChild,
	limitToLast,
	get,
	set,
} from "firebase/database";
import { database } from "@/lib/firebase";

// Helper function to validate session ID
const isValidSessionId = (id: string | null | undefined): id is string => {
	return typeof id === "string" && id.length > 0;
};

// Helper function to ensure index is ready
const ensureIndex = async (signalsRef: any) => {
	// Try to write a dummy signal to force index creation
	const dummyRef = ref(database, `${signalsRef.toString()}/dummy`);
	await set(dummyRef, {
		timestamp: Date.now(),
		type: "dummy",
	});
	// Remove the dummy signal
	await set(dummyRef, null);
};

// GET /api/signal/[sessionId]
export async function GET(
	request: NextRequest,
	context: { params: Promise<{ sessionId: string }> }
) {
	try {
		// Await params to get sessionId
		const { sessionId } = await context.params;

		if (!isValidSessionId(sessionId)) {
			return NextResponse.json(
				{ error: "Invalid or missing session ID" },
				{ status: 400 }
			);
		}

		const signalsRef = ref(database, `sessions/${sessionId}/signals`);
		let retryCount = 0;
		const maxRetries = 2;

		while (retryCount <= maxRetries) {
			try {
				if (retryCount > 0) {
					// Try to ensure index is ready on retry
					await ensureIndex(signalsRef);
				}

				// Try with index
				const signalsQuery = query(
					signalsRef,
					orderByChild("timestamp"),
					limitToLast(50)
				);
				const snapshot = await get(signalsQuery);
				const signals: any[] = [];

				snapshot.forEach((child) => {
					const signal = child.val();
					if (signal.type !== "dummy") {
						signals.push(signal);
					}
				});

				return NextResponse.json({ signals: signals.reverse() });
			} catch (indexError) {
				if (retryCount === maxRetries) {
					// Final fallback: get all signals and sort in memory
					console.warn(
						"Index not ready after retries, falling back to manual sort"
					);
					const snapshot = await get(signalsRef);
					const signals: any[] = [];

					snapshot.forEach((child) => {
						const signal = child.val();
						if (signal.type !== "dummy") {
							signals.push(signal);
						}
					});

					// Sort by timestamp in memory
					signals.sort((a, b) => b.timestamp - a.timestamp);

					// Limit to last 50
					return NextResponse.json({ signals: signals.slice(0, 50) });
				}
				retryCount++;
			}
		}

		return NextResponse.json({ signals: [] });
	} catch (error) {
		console.error("Error in GET /api/signal/[sessionId]:", error);
		return NextResponse.json(
			{ error: "Failed to fetch signals" },
			{ status: 500 }
		);
	}
}

// POST /api/signal/[sessionId]
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ sessionId: string }> }
) {
	try {
		// Await params to get sessionId
		const { sessionId } = await context.params;

		if (!isValidSessionId(sessionId)) {
			return NextResponse.json(
				{ error: "Invalid or missing session ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const signalsRef = ref(database, `sessions/${sessionId}/signals`);

		// Ensure timestamp and type are set
		const signal = {
			...body,
			timestamp: body.timestamp || Date.now(),
			type: body.type || "signal",
		};

		await push(signalsRef, signal);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in POST /api/signal/[sessionId]:", error);
		return NextResponse.json(
			{ error: "Failed to save signal" },
			{ status: 500 }
		);
	}
}

// Helper function to ensure we have a valid session ID
export async function generateStaticParams() {
	return [];
}
