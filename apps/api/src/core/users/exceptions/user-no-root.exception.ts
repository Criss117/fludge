import { UnauthorizedException } from '@nestjs/common';

export class UserNoRootException extends UnauthorizedException {
  constructor(msg?: string) {
    super(msg ?? 'No tiene permisos para realizar esta acción');
  }
}
