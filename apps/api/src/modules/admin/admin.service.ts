import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // Get all tenants (Super Admin only)
    async getAllTenants() {
        return this.prisma.tenant.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        projects: true,
                        channels: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    // Get all users across all tenants (Super Admin only)
    async getAllUsers() {
        return this.prisma.user.findMany({
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    // Create user in any tenant (Admin/Super Admin)
    async createUser(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
        tenantId: string;
    }) {
        const passwordHash = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: data.role,
                tenantId: data.tenantId,
                profile: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                },
            },
        });
    }

    // Update user role (Admin/Super Admin)
    async updateUserRole(userId: string, role: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    // Create tenant (Super Admin only)
    async createTenant(data: { name: string; planId?: string; status?: string }) {
        return this.prisma.tenant.create({
            data: {
                name: data.name,
                planId: data.planId || 'free',
                status: data.status || 'ACTIVE',
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        projects: true,
                        channels: true,
                    },
                },
            },
        });
    }

    // Update tenant (Super Admin only)
    async updateTenant(id: string, data: any) {
        return this.prisma.tenant.update({
            where: { id },
            data: {
                name: data.name,
                status: data.status,
                planId: data.planId,
                settings: data.settings,
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        projects: true,
                        channels: true,
                    },
                },
            },
        });
    }

    // Delete tenant (Super Admin only) - This will cascade delete all related data
    async deleteTenant(id: string) {
        // Delete all related data first
        await this.prisma.user.deleteMany({ where: { tenantId: id } });
        await this.prisma.project.deleteMany({ where: { tenantId: id } });
        await this.prisma.channel.deleteMany({ where: { tenantId: id } });
        
        return this.prisma.tenant.delete({
            where: { id },
        });
    }

    // Update user (Super Admin only)
    async updateUser(id: string, data: any) {
        const updateData: any = {};
        
        if (data.email) updateData.email = data.email;
        if (data.role) updateData.role = data.role;
        
        if (data.profile) {
            // Get existing user to preserve profile data
            const existingUser = await this.prisma.user.findUnique({
                where: { id },
                select: { profile: true },
            });
            
            const existingProfile = existingUser?.profile as any || {};
            updateData.profile = {
                ...existingProfile,
                firstName: data.profile.firstName !== undefined ? data.profile.firstName : existingProfile.firstName,
                lastName: data.profile.lastName !== undefined ? data.profile.lastName : existingProfile.lastName,
            };
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    // Delete user (Super Admin only)
    async deleteUser(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    // Get system analytics (Super Admin only)
    async getSystemAnalytics() {
        const [totalUsers, totalTenants, totalChannels, totalMessages] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.tenant.count(),
            this.prisma.channel.count(),
            this.prisma.message.count(),
        ]);

        return {
            totalUsers,
            totalTenants,
            totalChannels,
            totalMessages,
        };
    }
}
