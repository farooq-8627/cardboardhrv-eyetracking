"use client";

import { createClient } from "@supabase/supabase-js";

export interface HeartRateData {
	sessionId: string;
	heartRate: number;
	rrInterval: number;
	signalQuality: number;
	timestamp: number;
}

export class ConnectionService {
	private peerConnection: RTCPeerConnection | null = null;
	private dataChannel: RTCDataChannel | null = null;
	private supabase;
	private onDataCallback: ((data: HeartRateData) => void) | null = null;

	constructor() {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseKey) {
			throw new Error("Missing Supabase configuration");
		}

		this.supabase = createClient(supabaseUrl, supabaseKey);
		this.initializePeerConnection();
	}

	private initializePeerConnection() {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [
				{ urls: "stun:stun.l.google.com:19302" },
				{ urls: "stun:stun1.l.google.com:19302" },
			],
		});

		this.peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				this.sendIceCandidate(event.candidate);
			}
		};

		this.setupDataChannel();
	}

	private setupDataChannel() {
		if (!this.peerConnection) return;

		this.dataChannel = this.peerConnection.createDataChannel("heartRateData", {
			ordered: true,
		});

		this.dataChannel.onmessage = (event) => {
			const data = JSON.parse(event.data) as HeartRateData;
			this.handleHeartRateData(data);
		};

		this.dataChannel.onopen = () => {
			console.log("Data channel opened");
		};

		this.dataChannel.onclose = () => {
			console.log("Data channel closed");
		};
	}

	private async handleHeartRateData(data: HeartRateData) {
		try {
			// Store in Supabase
			await this.supabase.from("heart_rate_data").insert([
				{
					session_id: data.sessionId,
					heart_rate: data.heartRate,
					rr_interval: data.rrInterval,
					signal_quality: data.signalQuality,
					timestamp: data.timestamp,
				},
			]);

			// Call the callback if registered
			if (this.onDataCallback) {
				this.onDataCallback(data);
			}
		} catch (error) {
			console.error("Error storing heart rate data:", error);
		}
	}

	private async sendIceCandidate(candidate: RTCIceCandidate) {
		try {
			await this.supabase.from("ice_candidates").insert([
				{
					candidate: JSON.stringify(candidate),
					timestamp: new Date().toISOString(),
				},
			]);
		} catch (error) {
			console.error("Error sending ICE candidate:", error);
		}
	}

	async initiateConnection(): Promise<string> {
		if (!this.peerConnection) {
			throw new Error("PeerConnection not initialized");
		}

		try {
			const offer = await this.peerConnection.createOffer();
			await this.peerConnection.setLocalDescription(offer);

			const { data, error } = await this.supabase
				.from("connection_offers")
				.insert([
					{
						offer: JSON.stringify(offer),
						timestamp: new Date().toISOString(),
					},
				])
				.select();

			if (error) throw error;
			return data?.[0]?.id ?? "";
		} catch (error) {
			console.error("Error initiating connection:", error);
			throw error;
		}
	}

	async acceptAnswer(answer: RTCSessionDescriptionInit) {
		if (!this.peerConnection) {
			throw new Error("PeerConnection not initialized");
		}

		try {
			await this.peerConnection.setRemoteDescription(
				new RTCSessionDescription(answer)
			);
		} catch (error) {
			console.error("Error accepting answer:", error);
			throw error;
		}
	}

	onData(callback: (data: HeartRateData) => void) {
		this.onDataCallback = callback;
	}

	disconnect() {
		this.dataChannel?.close();
		this.peerConnection?.close();
		this.peerConnection = null;
		this.dataChannel = null;
		this.onDataCallback = null;
	}
}
