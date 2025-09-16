import { NotFoundException } from '@nestjs/common';

export class BusinessNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super(message || 'Business no existe');
  }
}
