import { create } from "zustand";
import {
	ConnectionService,
	ConnectionStatus,
} from "@/services/ConnectionService";

interface HeartRateData {
	value: number;
	timestamp: number;
}

interface ConnectionStore {
	connectionService: ConnectionService | null;
	connectionStatus: ConnectionStatus;
	remoteStream: MediaStream | null;
	heartRate: number | null;
	heartRateHistory: HeartRateData[];
	setConnectionStatus: (status: ConnectionStatus) => void;
	setRemoteStream: (stream: MediaStream | null) => void;
	setHeartRate: (rate: number) => void;
	addHeartRateData: (data: HeartRateData) => void;
	createSession: () => Promise<string>;
	disconnect: () => void;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
	connectionService: null,
	connectionStatus: "new",
	remoteStream: null,
	heartRate: null,
	heartRateHistory: [],

	setConnectionStatus: (status) => set({ connectionStatus: status }),

	setRemoteStream: (stream) => set({ remoteStream: stream }),

	setHeartRate: (rate) => set({ heartRate: rate }),

	addHeartRateData: (data) =>
		set((state) => ({
			heartRateHistory: [...state.heartRateHistory, data].slice(-30),
		})),

	createSession: async () => {
		const sessionId = Math.random().toString(36).substring(2, 15);
		return sessionId;
	},

	disconnect: () => {
		const { connectionService } = get();
		if (connectionService) {
			connectionService.disconnect();
		}
		set({
			connectionService: null,
			connectionStatus: "disconnected",
			remoteStream: null,
			heartRate: null,
			heartRateHistory: [],
		});
	},
}));
