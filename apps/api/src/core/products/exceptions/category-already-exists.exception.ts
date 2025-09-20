import { ConflictException } from '@nestjs/common';

export class CategoryAlreadyExistsException extends ConflictException {
  constructor(message?: string) {
    super(message || 'La categoría ya existe');
  }
}
