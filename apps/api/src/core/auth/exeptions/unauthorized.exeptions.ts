import { UnauthorizedException } from '@nestjs/common';

export class BadCredentialsExeption extends UnauthorizedException {
  constructor(msg?: string) {
    super(msg ?? 'Credenciales incorrectas');
  }
}
