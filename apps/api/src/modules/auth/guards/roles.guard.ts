import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@acf/shared';

export const ROLES_KEY = 'roles';

/**
 * RolesGuard — checks if the authenticated user has the required role.
 * Usage: @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No user in request');

    const roleHierarchy: Record<string, number> = {
      [UserRole.VIEWER]: 0,
      [UserRole.EDITOR]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPER_ADMIN]: 3,
    };

    const userLevel = roleHierarchy[user.role] ?? -1;
    const requiredLevel = Math.min(...requiredRoles.map((r) => roleHierarchy[r] ?? 99));

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(`Requires role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}
