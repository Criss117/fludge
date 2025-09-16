import { UnauthorizedException } from '@nestjs/common';

export class BadCredentialsException extends UnauthorizedException {
  constructor(msg?: string) {
    super(msg ?? 'Credenciales incorrectas');
  }
}
