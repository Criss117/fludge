import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/permissions.decorator';
import { SelectUser } from '@repo/db';
import { Permission } from '@repo/core/value-objects/permission';

// TODO: Implement permissions guard
@Injectable()
export class UserPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permissions: Permission[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!permissions.length) {
      throw new InternalServerErrorException('No permissions found');
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as SelectUser;

    if (!user) throw new BadRequestException('User not found');

    const userPermissions: Permission[] = ['products:create'];
    const permissionsSet = new Set(permissions);

    for (const permission of userPermissions) {
      if (!permissionsSet.has(permission)) {
        throw new UnauthorizedException('User does not have permission');
      }
    }

    return true;
  }
}
