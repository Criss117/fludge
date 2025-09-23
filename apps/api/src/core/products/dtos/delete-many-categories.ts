import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteManyCategoriesDto {
  @IsArray({
    message: 'Debe de ser un array',
  })
  @IsNotEmpty({
    message: 'No debe de estar vacío',
  })
  categoriesIds: string[];
}
