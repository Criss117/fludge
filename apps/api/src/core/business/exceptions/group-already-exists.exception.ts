import { ConflictException } from '@nestjs/common';

export class GroupAlreadyExistsException extends ConflictException {
  constructor(message?: string) {
    super(message || 'El grupo ya existe');
  }
}
