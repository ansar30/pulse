import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private messagesService: MessagesService) { }

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        // Extract user from JWT token in handshake
        const token = client.handshake.auth.token;
        // TODO: Verify JWT and attach user to socket
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinChannel')
    handleJoinChannel(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: string }
    ) {
        client.join(`channel:${data.channelId}`);
        console.log(`Client ${client.id} joined channel ${data.channelId}`);
    }

    @SubscribeMessage('leaveChannel')
    handleLeaveChannel(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: string }
    ) {
        client.leave(`channel:${data.channelId}`);
        console.log(`Client ${client.id} left channel ${data.channelId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: string; userId: string; content: string; type?: string }
    ) {
        try {
            const message = await this.messagesService.create(
                data.channelId,
                data.userId,
                data.content,
                data.type
            );

            // Broadcast to all clients in the channel
            this.server.to(`channel:${data.channelId}`).emit('newMessage', message);

            return message;
        } catch (error: any) {
            // Return error to the client
            client.emit('error', {
                message: error?.message || 'Failed to send message',
            });
            throw error;
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: string; userId: string; userName: string }
    ) {
        // Broadcast typing indicator to others in the channel
        client.to(`channel:${data.channelId}`).emit('userTyping', {
            userId: data.userId,
            userName: data.userName,
        });
    }

    @SubscribeMessage('stopTyping')
    handleStopTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { channelId: string; userId: string }
    ) {
        client.to(`channel:${data.channelId}`).emit('userStoppedTyping', {
            userId: data.userId,
        });
    }
}
