import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsUUID,
  IsDate,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(1, { message: 'El nombre debe tener al menos 1 carácter' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres' })
  name: string;

  @IsString({ message: 'El código de barras debe ser un texto válido' })
  @IsNotEmpty({ message: 'El código de barras es obligatorio' })
  @MaxLength(100, {
    message: 'El código de barras no puede exceder los 100 caracteres',
  })
  barcode: string;

  @IsNumber({}, { message: 'El precio de compra debe ser un número válido' })
  @IsPositive({ message: 'El precio de compra debe ser mayor a 0' })
  @Type(() => Number)
  purchasePrice: number;

  @IsNumber({}, { message: 'El precio de venta debe ser un número válido' })
  @IsPositive({ message: 'El precio de venta debe ser mayor a 0' })
  @Type(() => Number)
  salePrice: number;

  @IsNumber({}, { message: 'El precio mayorista debe ser un número válido' })
  @IsPositive({ message: 'El precio mayorista debe ser mayor a 0' })
  @Type(() => Number)
  wholesalePrice: number;

  @IsNumber({}, { message: 'El precio de oferta debe ser un número válido' })
  @IsPositive({ message: 'El precio de oferta debe ser mayor a 0' })
  @Type(() => Number)
  offerPrice: number;

  @IsNumber({}, { message: 'El stock mínimo debe ser un número válido' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  @Type(() => Number)
  minStock: number;

  @IsNumber({}, { message: 'El stock máximo debe ser un número válido' })
  @Min(0, { message: 'El stock máximo no puede ser negativo' })
  @Type(() => Number)
  stock: number;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(1000, {
    message: 'La descripción no puede exceder los 1000 caracteres',
  })
  description?: string | null;

  @IsOptional()
  @IsDate({ message: 'La fecha de creación debe ser una fecha válida' })
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate({ message: 'La fecha de actualización debe ser una fecha válida' })
  @Type(() => Date)
  updatedAt?: Date;

  @IsOptional()
  @IsDate({ message: 'La fecha de eliminación debe ser una fecha válida' })
  @Type(() => Date)
  deletedAt?: Date | null;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'El ID de categoría debe ser un texto válido' })
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID válido' })
  categoryId?: string | null;

  @IsOptional()
  @IsString({ message: 'El ID de marca debe ser un texto válido' })
  @IsUUID('4', { message: 'El ID de marca debe ser un UUID válido' })
  brandId?: string | null;

  @IsOptional()
  @IsBoolean({
    message: 'Permitir inventario negativo debe ser verdadero o falso',
  })
  @Type(() => Boolean)
  allowsNegativeInventory?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El peso debe ser un número válido' })
  @IsPositive({ message: 'El peso debe ser mayor a 0' })
  @Type(() => Number)
  weight?: number | null;

  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser un texto válido' })
  @IsUrl({}, { message: 'La URL de imagen debe ser una URL válida' })
  @MaxLength(500, {
    message: 'La URL de imagen no puede exceder los 500 caracteres',
  })
  imageUrl?: string | null;
}
