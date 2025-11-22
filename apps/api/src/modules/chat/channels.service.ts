import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChannelsService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, userId: string, userRole: string, data: { name: string; description?: string; type?: string }) {
        // Only ADMIN or SUPER_ADMIN can create channels
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Only admins can create channels');
        }

        const channel = await this.prisma.channel.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description,
                type: data.type || 'PUBLIC',
                createdBy: userId,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
            },
        });

        return channel;
    }

    async findAll(tenantId: string, userId: string) {
        // Return all PUBLIC channels for tenant + PRIVATE channels where user is creator or member
        // Exclude DIRECT channels from this list
        return this.prisma.channel.findMany({
            where: {
                tenantId,
                type: {
                    not: 'DIRECT',
                },
                OR: [
                    {
                        type: 'PUBLIC',
                    },
                    {
                        type: 'PRIVATE',
                        OR: [
                            {
                                createdBy: userId,
                            },
                            {
                                members: {
                                    some: {
                                        userId,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }

    async findDirectMessages(tenantId: string, userId: string) {
        // Return all DIRECT channels where the user is a member
        const channels = await this.prisma.channel.findMany({
            where: {
                tenantId,
                type: 'DIRECT',
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Get the last message for each channel
        const channelsWithLastMessage = await Promise.all(
            channels.map(async (channel) => {
                const lastMessage = await this.prisma.message.findFirst({
                    where: {
                        channelId: channel.id,
                        type: {
                            not: 'SYSTEM', // Exclude system messages
                        },
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
                    orderBy: {
                        createdAt: 'desc',
                    },
                });

                return {
                    ...channel,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        createdAt: lastMessage.createdAt,
                        user: lastMessage.user,
                    } : null,
                };
            })
        );

        return channelsWithLastMessage;
    }

    async findOne(id: string, tenantId: string) {
        return this.prisma.channel.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async addMember(channelId: string, userId: string) {
        // Check if user is already a member
        const existingMember = await this.prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId,
                },
            },
        });

        if (existingMember) {
            return existingMember;
        }

        return this.prisma.channelMember.create({
            data: {
                channelId,
                userId,
                role: 'MEMBER',
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

    async addMembers(channelId: string, userIds: string[], tenantId: string) {
        // Verify all users belong to the same tenant
        const users = await this.prisma.user.findMany({
            where: {
                id: { in: userIds },
                tenantId,
            },
        });

        if (users.length !== userIds.length) {
            throw new ForbiddenException('Some users do not belong to this tenant');
        }

        // Get existing members to avoid duplicates
        const existingMembers = await this.prisma.channelMember.findMany({
            where: {
                channelId,
                userId: { in: userIds },
            },
        });

        const existingUserIds = existingMembers.map(m => m.userId);
        const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

        if (newUserIds.length === 0) {
            return existingMembers;
        }

        // Add new members
        const members = await Promise.all(
            newUserIds.map(userId =>
                this.prisma.channelMember.create({
                    data: {
                        channelId,
                        userId,
                        role: 'MEMBER',
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
                })
            )
        );

        return [...existingMembers, ...members];
    }

    async removeMember(channelId: string, userId: string, requesterId: string) {
        // Verify channel exists and get creator info
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            select: { createdBy: true },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        // Check if requester is the creator
        const isCreator = channel.createdBy === requesterId;

        // Only creator can remove members (admins can also remove via AdminGuard)
        if (!isCreator) {
            throw new ForbiddenException('Only the channel creator can remove members');
        }

        const member = await this.prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId,
                },
            },
        });

        if (!member) {
            throw new NotFoundException('User is not a member of this channel');
        }

        // Prevent removing the creator
        if (userId === channel.createdBy) {
            throw new ForbiddenException('Cannot remove the channel creator');
        }

        return this.prisma.channelMember.delete({
            where: {
                channelId_userId: {
                    channelId,
                    userId,
                },
            },
        });
    }

    async deleteChannel(channelId: string, tenantId: string, userId: string, userRole: string) {
        // Verify channel exists
        const channel = await this.prisma.channel.findFirst({
            where: {
                id: channelId,
                tenantId,
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        // Only admin, super admin, or creator can delete
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        const isCreator = channel.createdBy === userId;

        if (!isAdmin && !isCreator) {
            throw new ForbiddenException('Only admins or channel creator can delete channels');
        }

        // Delete channel (cascade will delete members and messages)
        return this.prisma.channel.delete({
            where: { id: channelId },
        });
    }

    async joinChannel(channelId: string, userId: string, tenantId: string) {
        // Verify channel exists and is in the same tenant
        const channel = await this.prisma.channel.findFirst({
            where: {
                id: channelId,
                tenantId,
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        // Only public channels can be joined directly
        if (channel.type !== 'PUBLIC') {
            throw new ForbiddenException('Only public channels can be joined');
        }

        // Check if user is already a member
        const existingMember = await this.prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId,
                },
            },
        });

        if (existingMember) {
            return existingMember;
        }

        // Get user info for system message
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                profile: true,
            },
        });

        const userName = user?.profile 
            ? `${(user.profile as any).firstName || ''} ${(user.profile as any).lastName || ''}`.trim() || 'Someone'
            : 'Someone';

        // Create member
        const member = await this.prisma.channelMember.create({
            data: {
                channelId,
                userId,
                role: 'MEMBER',
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

        // Create system message
        await this.prisma.message.create({
            data: {
                channelId,
                userId,
                content: `${userName} joined the channel`,
                type: 'SYSTEM',
            },
        });

        return member;
    }

    async leaveChannel(channelId: string, userId: string, tenantId: string) {
        // Verify channel exists and is in the same tenant
        const channel = await this.prisma.channel.findFirst({
            where: {
                id: channelId,
                tenantId,
            },
        });

        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        const member = await this.prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId,
                },
            },
        });

        if (!member) {
            throw new NotFoundException('You are not a member of this channel');
        }

        // Get user info for system message
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                profile: true,
            },
        });

        const userName = user?.profile 
            ? `${(user.profile as any).firstName || ''} ${(user.profile as any).lastName || ''}`.trim() || 'Someone'
            : 'Someone';

        // Delete member
        await this.prisma.channelMember.delete({
            where: {
                channelId_userId: {
                    channelId,
                    userId,
                },
            },
        });

        // Create system message
        await this.prisma.message.create({
            data: {
                channelId,
                userId,
                content: `${userName} left the channel`,
                type: 'SYSTEM',
            },
        });

        return { success: true };
    }

    async getAvailableChannels(tenantId: string, userId: string) {
        // Get all public channels user is not yet a member of
        const allPublicChannels = await this.prisma.channel.findMany({
            where: {
                tenantId,
                type: 'PUBLIC',
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Filter out channels where user is already a member
        const availableChannels = allPublicChannels.filter(channel => {
            return !channel.members.some(member => member.userId === userId);
        });

        return availableChannels;
    }

    async updateLastRead(channelId: string, userId: string) {
        return this.prisma.channelMember.updateMany({
            where: {
                channelId,
                userId,
            },
            data: {
                lastRead: new Date(),
            },
        });
    }

    async createDirectMessage(tenantId: string, userId1: string, userId2: string) {
        // STRICT TENANT ISOLATION: Verify recipient user belongs to the same tenant
        const recipient = await this.prisma.user.findFirst({
            where: {
                id: userId2,
                tenantId, // Ensure recipient is in the same tenant
            },
        });

        if (!recipient) {
            throw new ForbiddenException('Cannot create direct message with user from different tenant');
        }

        // Check if DM already exists between these users
        const existingDM = await this.prisma.channel.findFirst({
            where: {
                tenantId,
                type: 'DIRECT',
                AND: [
                    {
                        members: {
                            some: {
                                userId: userId1,
                            },
                        },
                    },
                    {
                        members: {
                            some: {
                                userId: userId2,
                            },
                        },
                    },
                ],
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
            },
        });

        if (existingDM) {
            return existingDM;
        }

        // Create new DM channel
        return this.prisma.channel.create({
            data: {
                tenantId,
                name: `DM-${userId1}-${userId2}`,
                type: 'DIRECT',
                createdBy: userId1,
                members: {
                    create: [
                        { userId: userId1, role: 'MEMBER' },
                        { userId: userId2, role: 'MEMBER' },
                    ],
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
