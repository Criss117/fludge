import { NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super(message || 'La categoría no existe');
  }
}
