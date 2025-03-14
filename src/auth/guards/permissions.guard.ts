import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../users/entities/user.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!permissions) {
      return true;
    }
    const { user, headers }: { user: User; headers: any } = context
      .switchToHttp()
      .getRequest();
    let permissionGranted = false;
    for (const permission of permissions) {
      if (user.userAccess && user.userAccess[permission]) {
        permissionGranted = true;
      }
    }

    if (!permissionGranted) {
      throw new UnauthorizedException(
        this.i18nService.translate('common.missing_permission', {
          lang: headers['accept-language'] || 'fr',
        }) + ` [${permissions.join(', ')}]`,
      );
    }
    return true;
  }
}
