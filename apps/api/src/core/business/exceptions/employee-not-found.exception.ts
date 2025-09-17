import { NotFoundException } from '@nestjs/common';

export class EmployeeNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super(message || 'El empleado no existe');
  }
}
