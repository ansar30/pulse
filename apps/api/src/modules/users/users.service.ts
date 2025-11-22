import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                email: true,
                role: true,
                profile: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findOne(id: string, tenantId: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, tenantId },
            select: {
                id: true,
                email: true,
                role: true,
                profile: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: string, tenantId: string, data: any) {
        const user = await this.findOne(id, tenantId);

        // Merge profile data to preserve existing fields
        const currentProfile = (user.profile as any) || {};
        const updatedProfile = data.profile
            ? { ...currentProfile, ...data.profile }
            : currentProfile;

        return this.prisma.user.update({
            where: { id: user.id },
            data: {
                profile: updatedProfile,
                role: data.role,
            },
            select: {
                id: true,
                email: true,
                role: true,
                profile: true,
                isActive: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async updateAvatar(id: string, tenantId: string, avatarBase64: string) {
        try {
            const user = await this.findOne(id, tenantId);

            // Validate base64 image format
            if (!avatarBase64 || typeof avatarBase64 !== 'string') {
                throw new BadRequestException('Invalid avatar data');
            }

            // Check if it's a valid data URL format
            const dataUrlPattern = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/;
            if (!dataUrlPattern.test(avatarBase64)) {
                throw new BadRequestException('Invalid image format. Supported formats: JPEG, PNG, WebP, GIF');
            }

            // Check size (base64 is ~33% larger than binary, so 2MB binary ≈ 2.7MB base64)
            const base64Data = avatarBase64.split(',')[1];
            if (!base64Data) {
                throw new BadRequestException('Invalid base64 data');
            }
            const sizeInBytes = (base64Data.length * 3) / 4;
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (sizeInBytes > maxSize) {
                throw new BadRequestException('Image size exceeds 2MB limit');
            }

            // Merge with existing profile
            const currentProfile = (user.profile as any) || {};
            const updatedProfile = {
                ...currentProfile,
                avatar: avatarBase64,
            };

            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    profile: updatedProfile,
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    profile: true,
                    isActive: true,
                    tenantId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            return updatedUser;
        } catch (error: any) {
            console.error('Error updating avatar:', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to update avatar: ${error.message || 'Unknown error'}`);
        }
    }

    async removeAvatar(id: string, tenantId: string) {
        const user = await this.findOne(id, tenantId);

        // Merge with existing profile, removing avatar
        const currentProfile = (user.profile as any) || {};
        const { avatar, ...updatedProfile } = currentProfile;

        return this.prisma.user.update({
            where: { id: user.id },
            data: {
                profile: updatedProfile,
            },
            select: {
                id: true,
                email: true,
                role: true,
                profile: true,
                isActive: true,
                tenantId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: string, tenantId: string) {
        const user = await this.findOne(id, tenantId);

        return this.prisma.user.update({
            where: { id: user.id },
            data: { isActive: false },
        });
    }
}
