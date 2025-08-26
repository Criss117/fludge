import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/permissions.decorator';
import { Permission } from '@repo/core/value-objects/permission';
import { LogedUser } from '@repo/core/entities/user';

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
    const user = req.user as LogedUser;

    if (!user) throw new BadRequestException('User not found');

    // TODO: Check if the user has the required permissions
    return true;
  }
}
