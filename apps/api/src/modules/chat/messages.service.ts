import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaService) { }

    async create(channelId: string, userId: string, content: string, type: string = 'TEXT') {
        // Validate channel exists
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                members: {
                    where: { userId },
                },
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        // Both public and private channels require membership to send messages
        const isMember = channel.members.length > 0;
        if (!isMember) {
            throw new ForbiddenException('You must be a member of this channel to send messages');
        }

        const message = await this.prisma.message.create({
            data: {
                channelId,
                userId,
                content,
                type,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });

        // Update channel's updatedAt
        await this.prisma.channel.update({
            where: { id: channelId },
            data: { updatedAt: new Date() },
        });

        return message;
    }

    async findByChannel(channelId: string, userId: string, tenantId: string, limit: number = 50, before?: string) {
        // Validate user has access to the channel
        const channel = await this.prisma.channel.findFirst({
            where: {
                id: channelId,
                tenantId,
            },
            include: {
                members: {
                    where: { userId },
                },
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        // Check if user has access (member of channel or channel is public and user is in tenant)
        const isMember = channel.members.length > 0;
        const hasAccess = isMember || channel.type === 'PUBLIC';
        
        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this channel');
        }

        const where: any = { channelId };

        if (before) {
            where.createdAt = {
                lt: new Date(before),
            };
        }

        return this.prisma.message.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
    }

    async delete(id: string, userId: string) {
        return this.prisma.message.deleteMany({
            where: {
                id,
                userId, // Only allow deleting own messages
            },
        });
    }

    async createSystemMessage(channelId: string, userId: string, action: 'JOIN' | 'LEAVE', userName: string) {
        const actionText = action === 'JOIN' ? 'joined' : 'left';
        const content = `${userName} ${actionText} the channel`;

        return this.prisma.message.create({
            data: {
                channelId,
                userId,
                content,
                type: 'SYSTEM',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
    }
}
