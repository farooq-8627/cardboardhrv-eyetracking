export interface HRVWebSocketMessage {
	type: "hrv_data" | "error" | "connection_status";
	data: any;
}

export class HRVWebSocket {
	private ws: WebSocket | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectTimeout = 1000; // Start with 1 second
	private messageHandlers: ((message: HRVWebSocketMessage) => void)[] = [];

	constructor(private url: string = "ws://localhost:8000/ws") {}

	connect() {
		try {
			this.ws = new WebSocket(this.url);
			this.setupEventListeners();
		} catch (error) {
			console.error("Failed to create WebSocket connection:", error);
			this.handleReconnect();
		}
	}

	private setupEventListeners() {
		if (!this.ws) return;

		this.ws.onopen = () => {
			console.log("WebSocket connection established");
			this.reconnectAttempts = 0;
			this.reconnectTimeout = 1000;
			this.notifyHandlers({
				type: "connection_status",
				data: { status: "connected" },
			});
		};

		this.ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as HRVWebSocketMessage;
				this.notifyHandlers(message);
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error);
			}
		};

		this.ws.onclose = () => {
			console.log("WebSocket connection closed");
			this.notifyHandlers({
				type: "connection_status",
				data: { status: "disconnected" },
			});
			this.handleReconnect();
		};

		this.ws.onerror = (error) => {
			console.error("WebSocket error:", error);
			this.notifyHandlers({
				type: "error",
				data: { message: "WebSocket connection error" },
			});
		};
	}

	private handleReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(
				`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
			);

			setTimeout(() => {
				this.connect();
			}, this.reconnectTimeout);

			// Exponential backoff
			this.reconnectTimeout *= 2;
		} else {
			console.error("Max reconnection attempts reached");
			this.notifyHandlers({
				type: "error",
				data: { message: "Failed to establish WebSocket connection" },
			});
		}
	}

	sendMessage(message: any) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			try {
				this.ws.send(JSON.stringify(message));
			} catch (error) {
				console.error("Failed to send message:", error);
			}
		} else {
			console.error("WebSocket is not connected");
		}
	}

	addMessageHandler(handler: (message: HRVWebSocketMessage) => void) {
		this.messageHandlers.push(handler);
	}

	removeMessageHandler(handler: (message: HRVWebSocketMessage) => void) {
		this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
	}

	private notifyHandlers(message: HRVWebSocketMessage) {
		this.messageHandlers.forEach((handler) => handler(message));
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	// Send video frame data to the backend
	sendVideoFrame(frameData: string) {
		this.sendMessage({
			type: "video_frame",
			data: frameData,
		});
	}

	// Start HRV monitoring session
	startMonitoring() {
		this.sendMessage({
			type: "start_monitoring",
			data: {
				timestamp: Date.now(),
			},
		});
	}

	// Stop HRV monitoring session
	stopMonitoring() {
		this.sendMessage({
			type: "stop_monitoring",
			data: {
				timestamp: Date.now(),
			},
		});
	}
}
