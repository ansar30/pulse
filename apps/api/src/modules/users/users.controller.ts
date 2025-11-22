import { Controller, Get, Patch, Delete, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tenants/:tenantId/users')
@UseGuards(JwtAuthGuard, TenantGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    findAll(@Param('tenantId') tenantId: string) {
        return this.usersService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('tenantId') tenantId: string, @Param('id') id: string) {
        return this.usersService.findOne(id, tenantId);
    }

    @Patch(':id')
    update(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() updateData: any
    ) {
        return this.usersService.update(id, tenantId, updateData);
    }

    @Post(':id/avatar')
    async uploadAvatar(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: { avatar: string }
    ) {
        if (!body.avatar || typeof body.avatar !== 'string') {
            throw new BadRequestException('Avatar data is required');
        }

        return await this.usersService.updateAvatar(id, tenantId, body.avatar);
    }

    @Delete(':id/avatar')
    async removeAvatar(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string
    ) {
        return await this.usersService.removeAvatar(id, tenantId);
    }

    @Delete(':id')
    remove(@Param('tenantId') tenantId: string, @Param('id') id: string) {
        return this.usersService.remove(id, tenantId);
    }
}
