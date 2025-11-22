import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('tenants/:tenantId/projects')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProjectsController {
    constructor(private projectsService: ProjectsService) { }

    @Post()
    create(@Param('tenantId') tenantId: string, @Body() createData: any) {
        return this.projectsService.create(tenantId, createData);
    }

    @Get()
    findAll(@Param('tenantId') tenantId: string) {
        return this.projectsService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Param('tenantId') tenantId: string, @Param('id') id: string) {
        return this.projectsService.findOne(id, tenantId);
    }

    @Patch(':id')
    update(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() updateData: any
    ) {
        return this.projectsService.update(id, tenantId, updateData);
    }

    @Delete(':id')
    remove(@Param('tenantId') tenantId: string, @Param('id') id: string) {
        return this.projectsService.remove(id, tenantId);
    }
}
