import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        return this.prisma.project.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description,
                settings: data.settings || {},
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.project.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const project = await this.prisma.project.findFirst({
            where: { id, tenantId },
            include: {
                resources: true,
            },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    async update(id: string, tenantId: string, data: any) {
        await this.findOne(id, tenantId);

        return this.prisma.project.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                settings: data.settings,
            },
        });
    }

    async remove(id: string, tenantId: string) {
        await this.findOne(id, tenantId);

        return this.prisma.project.delete({
            where: { id },
        });
    }
}
