"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { useConnectionStore } from "@/stores/connectionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Smartphone, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	ConnectionService,
	ConnectionStatus,
} from "@/services/ConnectionService";

export function QRConnect() {
	const [qrValue, setQrValue] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const { createSession, connectionStatus, setConnectionStatus, disconnect } =
		useConnectionStore();
	const connectionServiceRef = useRef<ConnectionService | null>(null);
	const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		let isMounted = true;

		const initConnection = async () => {
			try {
				setIsLoading(true);
				setError("");
				setConnectionStatus("new");

				// Create a new session
				const sessionId = await createSession();
				const url = `${window.location.origin}/connect-phone/${sessionId}`;
				setQrValue(url);

				// Initialize connection service with desktop type
				const service = new ConnectionService(
					sessionId,
					"desktop",
					(status) => {
						if (isMounted) {
							setConnectionStatus(status);
							if (
								status === "connected" ||
								status === "failed" ||
								status === "disconnected"
							) {
								if (pollIntervalRef.current) {
									clearInterval(pollIntervalRef.current);
									pollIntervalRef.current = null;
								}
							}
						}
					}
				);
				connectionServiceRef.current = service;

				// Create and send offer
				await service.createOffer();
				setIsLoading(false);

				// Start polling for answer
				pollIntervalRef.current = setInterval(async () => {
					try {
						const response = await fetch(`/api/signal/${sessionId}`);
						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}
						const { signals } = await response.json();

						for (const signal of signals) {
							if (signal.type === "answer" || signal.type === "ice-candidate") {
								await service.handleSignal(signal);
							}
						}
					} catch (error) {
						console.error("Error polling signals:", error);
						if (isMounted) {
							setError("Connection error. Please try refreshing the page.");
						}
					}
				}, 1000);
			} catch (error) {
				console.error("Error creating session:", error);
				if (isMounted) {
					setError("Failed to create connection. Please try again.");
					setConnectionStatus("failed");
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		initConnection();

		return () => {
			isMounted = false;
			if (pollIntervalRef.current) {
				clearInterval(pollIntervalRef.current);
			}
			if (connectionServiceRef.current) {
				connectionServiceRef.current.disconnect();
			}
			disconnect();
		};
	}, [createSession, disconnect, setConnectionStatus]);

	const getStatusColor = () => {
		switch (connectionStatus) {
			case "connected":
				return "text-green-500";
			case "connecting":
			case "new":
			case "checking":
				return "text-yellow-500";
			default:
				return "text-red-500";
		}
	};

	const getStatusIcon = () => {
		switch (connectionStatus) {
			case "connected":
				return <Wifi className={getStatusColor()} />;
			case "connecting":
			case "new":
			case "checking":
				return <Loader2 className={`${getStatusColor()} animate-spin`} />;
			default:
				return <WifiOff className={getStatusColor()} />;
		}
	};

	const getStatusText = () => {
		switch (connectionStatus) {
			case "new":
				return "Waiting for phone...";
			case "connecting":
				return "Connecting...";
			case "checking":
				return "Checking connection...";
			case "connected":
				return "Connected";
			case "disconnected":
				return "Disconnected";
			case "failed":
				return "Connection failed";
			default:
				return connectionStatus;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Smartphone className="h-5 w-5" />
					Connect Your Phone
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2">
					<span>Status:</span>
					{getStatusIcon()}
					<span className={`capitalize ${getStatusColor()}`}>
						{getStatusText()}
					</span>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{isLoading ? (
					<div className="flex justify-center p-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : qrValue ? (
					<div className="flex flex-col items-center space-y-4">
						<div className="bg-white p-4 rounded-lg">
							<QRCode value={qrValue} />
						</div>
						<p className="text-sm text-muted-foreground text-center">
							Scan this QR code with your phone's camera or{" "}
							<a
								href={qrValue}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								click here
							</a>{" "}
							to open in a new tab
						</p>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
