import {
	ref,
	set,
	onValue,
	onDisconnect,
	off,
	push,
	get,
} from "firebase/database";
import { database } from "@/lib/firebase";

export type DeviceType = "mobile" | "desktop";
export type ConnectionStatus =
	| "new"
	| "connecting"
	| "checking"
	| "connected"
	| "disconnected"
	| "failed";

export interface SignalData {
	type: "offer" | "answer" | "ice-candidate";
	sdp?: string;
	candidate?: RTCIceCandidate;
}

interface HeartRateData {
	redValue: number;
	timestamp: number;
}

type EventMap = {
	connectionStatusChanged: ConnectionStatus;
	devicesPaired: string;
	deviceDisconnected: string;
	heartRateData: HeartRateData;
	message: any;
};

type EventListeners = {
	[K in keyof EventMap]: ((data: EventMap[K]) => void)[];
};

export class ConnectionService {
	private sessionId: string;
	private deviceType: DeviceType;
	private deviceId: string;
	private peerConnection: RTCPeerConnection | null = null;
	private dataChannel: RTCDataChannel | null = null;
	private stream: MediaStream | null = null;
	private eventListeners: EventListeners = {
		connectionStatusChanged: [],
		devicesPaired: [],
		deviceDisconnected: [],
		heartRateData: [],
		message: [],
	};
	private isInitialized = false;
	private connectionStatus: ConnectionStatus = "new";
	private pairedDeviceId: string | null = null;
	private pollInterval: NodeJS.Timeout | null = null;
	private iceCandidateQueue: RTCIceCandidate[] = [];
	private isRemoteDescriptionSet = false;
	private hasReceivedAnswer = false;

	constructor(
		sessionId: string,
		deviceType: DeviceType,
		onStatusChange: (status: ConnectionStatus) => void,
		onVideoStream?: (stream: MediaStream) => void
	) {
		this.sessionId = sessionId;
		this.deviceType = deviceType;
		this.deviceId = this.generateDeviceId();

		this.setupPeerConnection(onStatusChange, onVideoStream);
		this.setupFirebase();
	}

	private generateDeviceId(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	private setupPeerConnection(
		onStatusChange: (status: ConnectionStatus) => void,
		onVideoStream?: (stream: MediaStream) => void
	) {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
		});

		this.peerConnection.onicecandidate = (event) => {
			if (event.candidate && !this.peerConnection?.remoteDescription) {
				this.sendSignal({
					type: "ice-candidate",
					candidate: event.candidate,
				});
			}
		};

		this.peerConnection.onconnectionstatechange = () => {
			const status = this.peerConnection?.connectionState;
			console.log("Connection state changed:", status);

			if (
				status === "connected" ||
				status === "disconnected" ||
				status === "failed"
			) {
				this.connectionStatus = status as ConnectionStatus;
				onStatusChange(this.connectionStatus);
				this.updateFirebaseStatus(this.connectionStatus);

				if (status === "connected" && this.pollInterval) {
					clearInterval(this.pollInterval);
					this.pollInterval = null;
				}
			}
		};

		this.peerConnection.ondatachannel = (event) => {
			this.dataChannel = event.channel;
			this.setupDataChannel();
		};

		this.peerConnection.ontrack = (event) => {
			if (onVideoStream && event.streams[0]) {
				onVideoStream(event.streams[0]);
			}
		};

		this.peerConnection.oniceconnectionstatechange = () => {
			console.log(
				"ICE connection state:",
				this.peerConnection?.iceConnectionState
			);
		};

		this.peerConnection.onicegatheringstatechange = () => {
			console.log(
				"ICE gathering state:",
				this.peerConnection?.iceGatheringState
			);
		};

		this.peerConnection.onsignalingstatechange = () => {
			console.log("Signaling state:", this.peerConnection?.signalingState);
		};
	}

	private setupFirebase() {
		const deviceRef = ref(
			database,
			`sessions/${this.sessionId}/devices/${this.deviceId}`
		);

		// Only store serializable data
		const deviceData = {
			type: this.deviceType,
			lastSeen: Date.now(),
			status: this.connectionStatus,
		};

		set(deviceRef, deviceData);

		onDisconnect(deviceRef).remove();

		// Monitor other devices
		const devicesRef = ref(database, `sessions/${this.sessionId}/devices`);
		onValue(devicesRef, (snapshot) => {
			const devices = snapshot.val() || {};
			this.handleDevicesUpdate(devices);
		});
	}

	private handleDevicesUpdate(devices: Record<string, any>) {
		const otherDevices = Object.entries(devices).filter(
			([id, device]) => id !== this.deviceId
		);

		if (otherDevices.length > 0) {
			const [pairedId, pairedDevice] = otherDevices[0];
			if (pairedDevice.type !== this.deviceType) {
				this.pairedDeviceId = pairedId;
				this.emit("devicesPaired", pairedId);
			}
		}
	}

	private updateFirebaseStatus(status: ConnectionStatus) {
		const deviceRef = ref(
			database,
			`sessions/${this.sessionId}/devices/${this.deviceId}`
		);

		// Only update serializable data
		const deviceData = {
			type: this.deviceType,
			lastSeen: Date.now(),
			status,
		};

		set(deviceRef, deviceData);
	}

	private setupDataChannel() {
		if (!this.dataChannel) return;

		this.dataChannel.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "heartRate") {
					this.emit("heartRateData", data);
					this.sendToFirebase(data);
				}
				this.emit("message", data);
			} catch (error) {
				console.error("Error parsing data:", error);
			}
		};

		this.dataChannel.onopen = () => console.log("Data channel opened");
		this.dataChannel.onclose = () => console.log("Data channel closed");
	}

	private async sendSignal(signal: any) {
		try {
			console.log("Sending signal:", signal.type);
			const response = await fetch(`/api/signal/${this.sessionId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...signal, timestamp: Date.now() }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to send signal");
			}
		} catch (error) {
			console.error("Error sending signal:", error);
			throw error;
		}
	}

	private async pollSignals() {
		if (
			this.peerConnection?.connectionState === "connected" ||
			this.peerConnection?.connectionState === "closed" ||
			(this.deviceType === "desktop" && this.hasReceivedAnswer)
		) {
			if (this.pollInterval) {
				clearInterval(this.pollInterval);
				this.pollInterval = null;
			}
			return;
		}

		try {
			const response = await fetch(`/api/signal/${this.sessionId}`);
			if (!response.ok) throw new Error("Failed to poll signals");

			const { signals } = await response.json();
			if (signals && signals.length > 0) {
				const sortedSignals = signals.sort(
					(a: any, b: any) => a.timestamp - b.timestamp
				);
				for (const signal of sortedSignals) {
					await this.handleSignal(signal);
				}
			}
		} catch (error) {
			console.error("Error polling signals:", error);
		}
	}

	public async handleSignal(signal: SignalData) {
		if (!this.peerConnection) return;

		try {
			if (signal.type === "offer") {
				await this.peerConnection.setRemoteDescription(
					new RTCSessionDescription({ type: "offer", sdp: signal.sdp })
				);
				this.isRemoteDescriptionSet = true;
				await this.processIceCandidateQueue();

				const answer = await this.peerConnection.createAnswer();
				await this.peerConnection.setLocalDescription(answer);
				await this.sendSignal({
					type: "answer",
					sdp: answer.sdp,
				});
			} else if (signal.type === "answer") {
				await this.peerConnection.setRemoteDescription(
					new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
				);
				this.isRemoteDescriptionSet = true;
				this.hasReceivedAnswer = true;
				await this.processIceCandidateQueue();
			} else if (signal.type === "ice-candidate" && signal.candidate) {
				if (this.isRemoteDescriptionSet) {
					await this.peerConnection.addIceCandidate(signal.candidate);
				} else {
					this.iceCandidateQueue.push(signal.candidate);
				}
			}
		} catch (error) {
			console.error("Error handling signal:", error);
			throw error;
		}
	}

	private async processIceCandidateQueue() {
		if (!this.isRemoteDescriptionSet) return;

		while (this.iceCandidateQueue.length > 0) {
			const candidate = this.iceCandidateQueue.shift();
			if (candidate) {
				try {
					await this.peerConnection?.addIceCandidate(candidate);
					console.log("Processed queued ICE candidate");
				} catch (error) {
					console.error("Error processing queued ICE candidate:", error);
					this.iceCandidateQueue.unshift(candidate);
					break;
				}
			}
		}
	}

	private async sendToFirebase(data: HeartRateData) {
		const heartRateRef = ref(
			database,
			`sessions/${this.sessionId}/heartRateData`
		);
		await push(heartRateRef, {
			...data,
			deviceId: this.deviceId,
			timestamp: Date.now(),
		});
	}

	private emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
		this.eventListeners[event].forEach((listener) => listener(data));
	}

	public on<K extends keyof EventMap>(
		event: K,
		callback: (data: EventMap[K]) => void
	) {
		this.eventListeners[event].push(callback);
	}

	public off<K extends keyof EventMap>(
		event: K,
		callback: (data: EventMap[K]) => void
	) {
		this.eventListeners[event] = this.eventListeners[event].filter(
			(listener) => listener !== callback
		);
	}

	public async initializeAsDesktop() {
		if (this.isInitialized) return;
		this.isInitialized = true;

		try {
			const offer = await this.peerConnection?.createOffer();
			await this.peerConnection?.setLocalDescription(offer);
			await this.sendSignal({ type: "offer", offer });

			if (this.pollInterval) clearInterval(this.pollInterval);
			this.pollInterval = setInterval(() => this.pollSignals(), 1000);
		} catch (error) {
			console.error("Error initializing as desktop:", error);
			throw error;
		}
	}

	public async initializeAsMobile(stream: MediaStream) {
		if (this.isInitialized) return;
		this.isInitialized = true;

		try {
			this.stream = stream;
			stream.getTracks().forEach((track) => {
				this.peerConnection?.addTrack(track, stream);
			});

			if (this.pollInterval) clearInterval(this.pollInterval);
			this.pollInterval = setInterval(() => this.pollSignals(), 1000);
		} catch (error) {
			console.error("Error initializing as mobile:", error);
			throw error;
		}
	}

	public disconnect() {
		if (this.pollInterval) {
			clearInterval(this.pollInterval);
			this.pollInterval = null;
		}

		if (this.dataChannel) {
			this.dataChannel.close();
			this.dataChannel = null;
		}

		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
			this.stream = null;
		}

		const deviceRef = ref(
			database,
			`sessions/${this.sessionId}/devices/${this.deviceId}`
		);
		set(deviceRef, null);

		if (this.peerConnection) {
			this.peerConnection.close();
		}

		this.isInitialized = false;
		this.connectionStatus = "disconnected";
		this.pairedDeviceId = null;
		this.isRemoteDescriptionSet = false;
		this.hasReceivedAnswer = false;
		this.iceCandidateQueue = [];
	}

	public sendHeartRateData(data: HeartRateData) {
		if (this.dataChannel?.readyState === "open") {
			this.dataChannel.send(
				JSON.stringify({
					type: "heartRate",
					...data,
				})
			);
		}
	}

	public async createOffer() {
		if (!this.peerConnection) return;

		try {
			const offer = await this.peerConnection.createOffer();
			await this.peerConnection.setLocalDescription(offer);
			await this.sendSignal({
				type: "offer",
				sdp: offer.sdp,
			});
		} catch (error) {
			console.error("Error creating offer:", error);
			throw error;
		}
	}
}
