import { NotFoundException } from '@nestjs/common';

export class UserNotFoundExeption extends NotFoundException {
  constructor(msg?: string) {
    super(msg ?? 'El usuario no existe');
  }
}
