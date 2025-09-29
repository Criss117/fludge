import { NotFoundException } from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super(message || 'El producto no se encuentra');
  }
}
