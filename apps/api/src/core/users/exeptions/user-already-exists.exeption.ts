import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsExeption extends ConflictException {
  constructor(message?: string) {
    super(message ?? 'El usuario ya existe');
  }
}
