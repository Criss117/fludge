import { IsEmail, IsString, MaxLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString({
    message: 'La contraseña es obligatoria',
  })
  @MaxLength(255, {
    message: 'La contraseña debe tener menos de 255 caracteres',
  })
  password: string;
}

export class SignInEmployeeDto {
  @IsString({
    message: 'El nombre de usuario es obligatorio',
  })
  @MaxLength(100, {
    message: 'El nombre de usuario debe tener menos de 100 caracteres',
  })
  username: string;

  @IsString({
    message: 'La contraseña es obligatoria',
  })
  @MaxLength(255, {
    message: 'La contraseña debe tener menos de 255 caracteres',
  })
  password: string;
}
