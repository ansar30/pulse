import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginRequest, RegisterRequest, LoginResponse } from '@business-app/types';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async register(dto: RegisterRequest): Promise<LoginResponse> {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Create tenant first
        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.tenantName,
                planId: 'free',
                status: 'TRIAL',
            },
        });

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                tenantId: tenant.id,
                role: 'ADMIN', // First user is admin
                profile: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                },
            },
            include: {
                tenant: true,
            },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }

    async login(dto: LoginRequest): Promise<LoginResponse> {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { tenant: true },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true },
        });

        if (!user || !user.isActive) {
            return null;
        }

        return this.sanitizeUser(user);
    }

    private async generateTokens(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken,
        };
    }

    private sanitizeUser(user: any) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
}
