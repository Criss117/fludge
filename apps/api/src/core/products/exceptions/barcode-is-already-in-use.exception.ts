import { ConflictException } from '@nestjs/common';

export class BarcodeIsAlreadyInUseException extends ConflictException {
  constructor(message?: string) {
    super(message || 'El código de barras ya está en uso');
  }
}
