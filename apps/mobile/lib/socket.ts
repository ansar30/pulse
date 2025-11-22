import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let socket: Socket | null = null;

// Get API URL with same pattern as api-client
const getApiUrl = () => {
    const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (expoApiUrl) return expoApiUrl;

    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    return 'http://localhost:3001';
};

export function initSocket(token: string): Socket {
    if (socket?.connected) {
        return socket;
    }

    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
    }

    const API_URL = getApiUrl();
    console.log('[Socket] Connecting to:', `${API_URL}/chat`);

    socket = io(`${API_URL}/chat`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
}

export function getSocket(): Socket | null {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

