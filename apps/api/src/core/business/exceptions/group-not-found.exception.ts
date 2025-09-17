import { NotFoundException } from '@nestjs/common';

export class GroupNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super(message || 'No se encontro el grupo');
  }
}
