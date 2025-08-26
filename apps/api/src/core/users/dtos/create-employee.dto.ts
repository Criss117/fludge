import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(255, {
    message: 'La contraseña no puede tener más de 255 caracteres',
  })
  password: string;

  @IsString({
    message: 'El nombre de usuario no puede estar vacío',
  })
  @MaxLength(100, {
    message: 'El nombre de usuario debe tener como máximo 100 caracteres',
  })
  @MinLength(5, {
    message: 'El nombre de usuario debe tener como mínimo 5 caracteres',
  })
  username: string;

  @IsString({
    message: 'El nombre del usuario no puede estar vacío',
  })
  @MaxLength(100, {
    message: 'El nombre del usuario debe tener como máximo 100 caracteres',
  })
  @MinLength(5, {
    message: 'El nombre del usuario debe tener como mínimo 5 caracteres',
  })
  firstName: string;

  @IsString({
    message: 'El apellido del usuario no puede estar vacío',
  })
  @MaxLength(100, {
    message: 'El apellido del usuario debe tener como máximo 100 caracteres',
  })
  @MinLength(5, {
    message: 'El apellido del usuario debe tener como mínimo 5 caracteres',
  })
  lastName: string;

  @IsUUID()
  @IsString({
    message: 'El grupo no puede estar vacío',
  })
  groupId: string;
}
