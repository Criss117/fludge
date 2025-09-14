import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupDto {
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
}
