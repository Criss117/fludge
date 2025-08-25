import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { UserPermissionsGuard } from '../guards/user-permissions.guard';
import type { Permission } from '@repo/core/value-objects/permission';

export const META_ROLES = Symbol('roles');

export const Permissions = (...args: Permission[]) => {
  return applyDecorators(
    SetMetadata(META_ROLES, args),
    UseGuards(UserPermissionsGuard),
  );
};
