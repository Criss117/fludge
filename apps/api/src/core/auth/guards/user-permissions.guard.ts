import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_PERMISSIONS } from '../decorators/permissions.decorator';
import { Permission } from '@repo/core/value-objects/permission';
import { LogedUser } from '@repo/core/entities/user';
import { FindOneBusinessUseCase } from '@core/business/use-cases/find-one-business.usecase';

// TODO: Implement permissions guard
@Injectable()
export class UserPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly findOneBusinessUseCase: FindOneBusinessUseCase,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const url = req.url as string;

    if (!url.includes('business')) {
      throw new InternalServerErrorException();
    }

    const permissions: Permission[] = this.reflector.get(
      META_PERMISSIONS,
      context.getHandler(),
    );

    if (!permissions.length) {
      throw new InternalServerErrorException('No permissions found');
    }

    const user = req.user as LogedUser;
    const businessId = req.params.id as string;

    if (!user) throw new BadRequestException('User not found');

    const business = await this.findOneBusinessUseCase.execute(
      businessId,
      user.id,
    );
    req.business = business;
    // return true;

    const userIsRootOrEmployeeInBusiness =
      business.rootUserId === user.id ||
      business.employees.some((e) => e.id === user.id);

    if (!userIsRootOrEmployeeInBusiness) {
      throw new UnauthorizedException("You don't have permissions to do this");
    }

    if (user.isRoot) {
      return true;
    }

    const userPermissions = user.isEmployeeIn.map((e) => e.permissions);

    const userHasPermissions = permissions.some((p) =>
      userPermissions.some((up) => up.includes(p)),
    );

    if (!userHasPermissions) {
      throw new UnauthorizedException("You don't have permissions to do this");
    }

    // TODO: Check if the user has the required permissions
    return true;
  }
}
