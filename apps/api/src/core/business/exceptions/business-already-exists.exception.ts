import { ConflictException } from '@nestjs/common';

export class BusinessAlreadyExistsException extends ConflictException {
  constructor(msg?: string) {
    super(msg ?? 'El negocio ya existe');
  }
}
