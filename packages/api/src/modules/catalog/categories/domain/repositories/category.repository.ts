import type { Result } from "@fludge/utils/trycatch";
import type { Category } from "../entities/category.entity";

export interface CategoryRepository {
  findOneById(
    organizationId: string,
    categoryId: string,
  ): Promise<Result<Category | null>>;

  save(category: Category): Promise<Result<unknown, Error>>;
}
