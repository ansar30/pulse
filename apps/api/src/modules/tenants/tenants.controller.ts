import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TenantsController {
    constructor(private tenantsService: TenantsService) { }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.tenantsService.update(id, updateData);
    }
}
