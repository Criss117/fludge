import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString({
    message: 'La categoría debe tener un nombre',
  })
  @IsNotEmpty({
    message: 'La categoría no puede estar vacía',
  })
  name: string;

  @IsOptional()
  @IsString({
    message: 'La descripción de la categoría debe tener una descripción',
  })
  description?: string | null;
}
