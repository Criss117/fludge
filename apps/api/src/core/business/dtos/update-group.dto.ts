import {
  allPermissions,
  type Permission,
} from '@repo/core/value-objects/permission';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateGroupDto {
  @IsString({
    message: 'El nombre del grupo es obligatorio',
  })
  @MaxLength(100, {
    message: 'El nombre del grupo debe tener un máximo de 255 caracteres',
  })
  @IsOptional()
  name?: string;

  @IsString({
    message: 'La descripción del grupo es obligatoria',
  })
  @MaxLength(255, {
    message: 'La descripción del grupo debe tener un máximo de 255 caracteres',
  })
  @IsOptional()
  description?: string;

  @IsArray({
    message: 'Los permisos deben ser un array válido',
  })
  @ArrayNotEmpty({
    message: 'Los permisos del grupo son obligatorios',
  })
  @ArrayMinSize(1, {
    message: 'Los permisos del grupo deben tener al menos un permiso',
  })
  @IsEnum(allPermissions, {
    each: true,
    message: 'Cada permiso debe ser un valor válido',
  })
  @IsOptional()
  permissions?: Permission[];
}
