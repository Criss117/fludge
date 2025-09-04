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

    if (!url.includes('business')) throw new InternalServerErrorException();

    const permissions: Permission[] = this.reflector.get(
      META_PERMISSIONS,
      context.getHandler(),
    );

    if (!permissions.length)
      throw new InternalServerErrorException('No permissions found');

    const user = req.user as LogedUser;
    const businessId = req.params.id as string;

    if (!user) throw new BadRequestException('User not found');

    const business = await this.findOneBusinessUseCase.execute(
      businessId,
      user.id,
    );

    if (!business) throw new BadRequestException('El negocio no existe');

    req.business = business;

    const userIsRootOrEmployeeInBusiness =
      business.rootUserId === user.id ||
      business.employees.some((e) => e.id === user.id);

    if (!userIsRootOrEmployeeInBusiness)
      throw new UnauthorizedException('No tiene permisos para hacer esto');

    if (user.isRoot) return true;

    //Here the user is an employee in the business

    if (permissions.length === 1 && permissions[0] === 'businesses:read')
      return true;

    const permissionsWitoutBusinessesRead = permissions.filter(
      (p) => p !== 'businesses:read',
    );

    const userPermissions = user.isEmployeeIn.map((e) => e.permissions);

    const userHasPermissions = permissionsWitoutBusinessesRead.some((p) =>
      userPermissions.some((up) => up.includes(p)),
    );

    if (!userHasPermissions)
      throw new UnauthorizedException('No tiene permisos para hacer esto');

    return true;
  }
}
