"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ConnectionService } from "@/lib/webrtc/ConnectionService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PhoneConnectProps {
	onConnect: (sessionId: string) => void;
}

export const PhoneConnect: React.FC<PhoneConnectProps> = ({ onConnect }) => {
	const [connectionId, setConnectionId] = useState<string>("");
	const [connectionStatus, setConnectionStatus] = useState<
		"disconnected" | "connecting" | "connected"
	>("disconnected");
	const [qrValue, setQrValue] = useState<string>("");
	const supabase = useSupabaseClient();
	const connectionService = new ConnectionService();

	useEffect(() => {
		const initializeConnection = async () => {
			try {
				setConnectionStatus("connecting");
				const id = await connectionService.initiateConnection();
				setConnectionId(id);
				setQrValue(`${window.location.origin}/connect/${id}`);
			} catch (error) {
				console.error("Connection initialization failed:", error);
				setConnectionStatus("disconnected");
			}
		};

		initializeConnection();

		// Subscribe to connection status changes
		const subscription = supabase
			.from(`connections:id=eq.${connectionId}`)
			.on("UPDATE", (payload) => {
				if (payload.new.status === "connected") {
					setConnectionStatus("connected");
					onConnect(connectionId);
				}
			})
			.subscribe();

		return () => {
			supabase.removeSubscription(subscription);
		};
	}, []);

	return (
		<div className="max-w-2xl mx-auto p-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-center">Connect Your Phone</CardTitle>
					<p
						className={`text-center ${
							connectionStatus === "connected"
								? "text-green-500"
								: connectionStatus === "connecting"
									? "text-yellow-500"
									: "text-red-500"
						}`}
					>
						Status:{" "}
						{connectionStatus.charAt(0).toUpperCase() +
							connectionStatus.slice(1)}
					</p>
				</CardHeader>
				<CardContent className="flex flex-col items-center space-y-6">
					{connectionStatus === "connecting" && (
						<div className="text-center space-y-4">
							<p className="text-muted-foreground">
								Scan this QR code with your phone's camera
							</p>
							<div className="bg-white p-4 rounded-lg inline-block">
								<QRCode value={qrValue} size={256} />
							</div>
							<p className="text-sm text-muted-foreground">
								Or visit:{" "}
								<a href={qrValue} className="text-primary hover:underline">
									{qrValue}
								</a>
							</p>
						</div>
					)}

					{connectionStatus === "connected" && (
						<div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center space-y-2">
							<h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
								Successfully Connected!
							</h3>
							<p className="text-green-600 dark:text-green-400">
								You can now start monitoring your heart rate.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
