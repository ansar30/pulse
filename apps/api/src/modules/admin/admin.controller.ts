import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('tenants')
    @UseGuards(SuperAdminGuard)
    getAllTenants() {
        return this.adminService.getAllTenants();
    }

    @Post('tenants')
    @UseGuards(SuperAdminGuard)
    createTenant(@Body() data: { name: string; planId?: string; status?: string }) {
        return this.adminService.createTenant(data);
    }

    @Patch('tenants/:id')
    @UseGuards(SuperAdminGuard)
    updateTenant(@Param('id') id: string, @Body() data: any) {
        return this.adminService.updateTenant(id, data);
    }

    @Delete('tenants/:id')
    @UseGuards(SuperAdminGuard)
    deleteTenant(@Param('id') id: string) {
        return this.adminService.deleteTenant(id);
    }

    @Get('users')
    @UseGuards(SuperAdminGuard)
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Post('users')
    @UseGuards(AdminGuard)
    createUser(@Body() data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
        tenantId: string;
    }) {
        return this.adminService.createUser(data);
    }

    @Patch('users/:id')
    @UseGuards(SuperAdminGuard)
    updateUser(@Param('id') id: string, @Body() data: any) {
        return this.adminService.updateUser(id, data);
    }

    @Patch('users/:id/role')
    @UseGuards(AdminGuard)
    updateUserRole(@Param('id') id: string, @Body() data: { role: string }) {
        return this.adminService.updateUserRole(id, data.role);
    }

    @Delete('users/:id')
    @UseGuards(SuperAdminGuard)
    deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    @Get('analytics')
    @UseGuards(SuperAdminGuard)
    getSystemAnalytics() {
        return this.adminService.getSystemAnalytics();
    }
}
