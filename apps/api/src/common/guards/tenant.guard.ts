import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = request.params.tenantId || request.body.tenantId;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Super admin can access all tenants
        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        // Regular users can only access their own tenant
        if (tenantId && user.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to this tenant');
        }

        return true;
    }
}
