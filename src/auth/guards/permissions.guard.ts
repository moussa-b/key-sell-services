import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!permissions) {
      return true;
    }
    const { user }: { user: User } = context.switchToHttp().getRequest();
    for (const permission of permissions) {
      if (user.userAccess && user.userAccess[permission]) {
        return true;
      }
    }
    return false;
  }
}
