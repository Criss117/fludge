import { ConflictException } from '@nestjs/common';

export class ProductAlreadyExistsException extends ConflictException {
  constructor(message?: string) {
    super(message || 'El producto ya existe');
  }
}
