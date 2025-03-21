"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PhoneConnectProps {
	onConnect?: (sessionId: string) => void;
}

export function PhoneConnect({ onConnect }: PhoneConnectProps) {
	const [sessionId, setSessionId] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState(false);

	const generateSession = async () => {
		setIsGenerating(true);
		try {
			// Generate a unique session ID (you might want to get this from your backend)
			const newSessionId = Math.random().toString(36).substring(2, 15);
			setSessionId(newSessionId);
			onConnect?.(newSessionId);
		} catch (error) {
			console.error("Failed to generate session:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="flex flex-col items-center space-y-6">
			<div className="text-center space-y-2">
				<p className="text-muted-foreground">
					Scan the QR code with your phone to start monitoring
				</p>
			</div>

			{sessionId ? (
				<Card className="p-4 bg-white">
					<QRCode
						value={`${window.location.origin}/connect/${sessionId}`}
						size={256}
						style={{ height: "auto", maxWidth: "100%", width: "100%" }}
						viewBox={`0 0 256 256`}
					/>
				</Card>
			) : (
				<Button
					onClick={generateSession}
					disabled={isGenerating}
					className="w-full max-w-xs"
				>
					{isGenerating ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Generating...
						</>
					) : (
						"Generate QR Code"
					)}
				</Button>
			)}

			{sessionId && (
				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Session ID: {sessionId}
					</p>
					<Button
						variant="outline"
						className="mt-2"
						onClick={() => setSessionId("")}
					>
						Generate New Code
					</Button>
				</div>
			)}
		</div>
	);
}
