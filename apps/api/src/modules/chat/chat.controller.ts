import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChannelsService } from './channels.service';
import { MessagesService } from './messages.service';

@Controller('tenants/:tenantId/chat')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ChatController {
    constructor(
        private channelsService: ChannelsService,
        private messagesService: MessagesService,
    ) { }

    @Get('channels')
    findAllChannels(@Param('tenantId') tenantId: string, @CurrentUser() user: any) {
        return this.channelsService.findAll(tenantId, user.id);
    }

    @Get('direct-messages')
    findDirectMessages(@Param('tenantId') tenantId: string, @CurrentUser() user: any) {
        return this.channelsService.findDirectMessages(tenantId, user.id);
    }

    @Post('channels')
    @UseGuards(AdminGuard)
    createChannel(
        @Param('tenantId') tenantId: string,
        @CurrentUser() user: any,
        @Body() data: { name: string; description?: string; type?: string }
    ) {
        return this.channelsService.create(tenantId, user.id, user.role, data);
    }

    @Get('channels/:id')
    findOneChannel(@Param('id') id: string, @Param('tenantId') tenantId: string) {
        return this.channelsService.findOne(id, tenantId);
    }

    @Get('channels/:id/messages')
    getMessages(
        @Param('tenantId') tenantId: string,
        @Param('id') channelId: string,
        @CurrentUser() user: any,
        @Query('limit') limit?: string,
        @Query('before') before?: string
    ) {
        return this.messagesService.findByChannel(
            channelId,
            user.id,
            tenantId,
            limit ? parseInt(limit) : 50,
            before
        );
    }

    @Post('channels/:id/messages')
    async sendMessage(
        @Param('id') channelId: string,
        @CurrentUser() user: any,
        @Body() data: { content: string; type?: string }
    ) {
        return this.messagesService.create(channelId, user.id, data.content, data.type);
    }

    @Patch('channels/:id/read')
    markAsRead(@Param('id') channelId: string, @CurrentUser() user: any) {
        return this.channelsService.updateLastRead(channelId, user.id);
    }

    @Delete('messages/:id')
    deleteMessage(@Param('id') id: string, @CurrentUser() user: any) {
        return this.messagesService.delete(id, user.id);
    }

    @Post('direct-messages')
    createDirectMessage(
        @Param('tenantId') tenantId: string,
        @CurrentUser() user: any,
        @Body() data: { recipientId: string }
    ) {
        return this.channelsService.createDirectMessage(tenantId, user.id, data.recipientId);
    }

    @Post('channels/:id/join')
    joinChannel(
        @Param('tenantId') tenantId: string,
        @Param('id') channelId: string,
        @CurrentUser() user: any
    ) {
        return this.channelsService.joinChannel(channelId, user.id, tenantId);
    }

    @Post('channels/:id/leave')
    leaveChannel(
        @Param('tenantId') tenantId: string,
        @Param('id') channelId: string,
        @CurrentUser() user: any
    ) {
        return this.channelsService.leaveChannel(channelId, user.id, tenantId);
    }

    @Get('channels/available')
    getAvailableChannels(
        @Param('tenantId') tenantId: string,
        @CurrentUser() user: any
    ) {
        return this.channelsService.getAvailableChannels(tenantId, user.id);
    }

    @Post('channels/:id/members')
    @UseGuards(AdminGuard)
    async addChannelMembers(
        @Param('tenantId') tenantId: string,
        @Param('id') channelId: string,
        @CurrentUser() user: any,
        @Body() data: { userIds: string[] }
    ) {
        // Verify channel exists and is private
        const channel = await this.channelsService.findOne(channelId, tenantId);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        if (channel.type !== 'PRIVATE') {
            throw new BadRequestException('Members can only be added to private channels');
        }
        return this.channelsService.addMembers(channelId, data.userIds, tenantId);
    }

    @Delete('channels/:id/members/:userId')
    async removeChannelMember(
        @Param('tenantId') tenantId: string,
        @Param('id') channelId: string,
        @Param('userId') userId: string,
        @CurrentUser() user: any
    ) {
        // Verify channel exists and is private
        const channel = await this.channelsService.findOne(channelId, tenantId);
        if (!channel) {
            throw new BadRequestException('Channel not found');
        }
        if (channel.type !== 'PRIVATE') {
            throw new BadRequestException('Members can only be removed from private channels');
        }

        // Check if user is admin/super admin or creator
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
        const isCreator = channel.createdBy === user.id;

        if (!isAdmin && !isCreator) {
            throw new ForbiddenException('Only admins or channel creator can remove members');
        }

        return this.channelsService.removeMember(channelId, userId, user.id);
    }

    @Delete('channels/:id')
    async deleteChannel(
        @Param('tenantId') tenantId: string,
        @Param('id') channelId: string,
        @CurrentUser() user: any
    ) {
        return this.channelsService.deleteChannel(channelId, tenantId, user.id, user.role);
    }
}
