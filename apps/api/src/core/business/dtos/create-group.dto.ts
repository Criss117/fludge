import {
  allPermissions,
  Permission,
} from '@repo/core/value-objects/permission';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString({
    message: 'El nombre del grupo es obligatorio',
  })
  @MaxLength(100, {
    message: 'El nombre del grupo debe tener un máximo de 255 caracteres',
  })
  name: string;

  @IsString({
    message: 'La descripción del grupo es obligatoria',
  })
  @MaxLength(255, {
    message: 'La descripción del grupo debe tener un máximo de 255 caracteres',
  })
  @IsOptional()
  description?: string;

  @IsEnum(allPermissions, {
    message: 'Los permisos del grupo son obligatorios',
  })
  @MinLength(1, {
    message: 'Los permisos del grupo deben tener al menos un permiso',
  })
  permissions: Permission[];
}
