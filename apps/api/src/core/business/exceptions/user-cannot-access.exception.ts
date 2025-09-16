import { UnauthorizedException } from '@nestjs/common';

export class UserCanNotAccessException extends UnauthorizedException {
  constructor(message?: string) {
    super(message || 'El usuario no puede acceder a este recurso');
  }
}
