import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(token: string) {
    if (socket?.connected) {
        return socket;
    }

    socket = io('http://localhost:3001/chat', {
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

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
