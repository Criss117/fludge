import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRootUserDto {
  @IsEmail()
  email: string;

  @IsString()
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
}
