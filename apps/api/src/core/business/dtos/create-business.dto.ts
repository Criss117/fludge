import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBusinessDto {
  @IsString({
    message: 'El nombre de la empresa es obligatorio',
  })
  @MaxLength(100, {
    message: 'El nombre de la empresa debe tener un máximo de 100 caracteres',
  })
  @MinLength(3, {
    message: 'El nombre de la empresa debe tener un mínimo de 3 caracteres',
  })
  name: string;

  @IsString({
    message: 'El NIT es obligatorio',
  })
  @MaxLength(20, {
    message: 'El NIT debe tener un máximo de 20 caracteres',
  })
  @MinLength(3, {
    message: 'El NIT debe tener un mínimo de 3 caracteres',
  })
  nit: string;

  @IsString({
    message: 'La dirección es obligatoria',
  })
  @MaxLength(255, {
    message: 'La dirección debe tener un máximo de 255 caracteres',
  })
  @MinLength(3, {
    message: 'La dirección debe tener un mínimo de 3 caracteres',
  })
  address: string;

  @IsString({
    message: 'La ciudad es obligatoria',
  })
  @MaxLength(255, {
    message: 'La ciudad debe tener un máximo de 255 caracteres',
  })
  @MinLength(3, {
    message: 'La ciudad debe tener un mínimo de 3 caracteres',
  })
  city: string;

  @IsString({
    message: 'El estado es obligatorio',
  })
  @MaxLength(255, {
    message: 'El estado debe tener un máximo de 255 caracteres',
  })
  @MinLength(3, {
    message: 'El estado debe tener un mínimo de 3 caracteres',
  })
  @IsOptional()
  state?: string | null;
}
