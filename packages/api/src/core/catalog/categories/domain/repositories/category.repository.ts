import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Category } from "../entities/category.entity";

export type Options = {
  tx?: TransactionService;
};

export interface CategoryRepository {
  findById(
    organizationId: string,
    categoryId: string,
  ): Promise<Result<Category | null>>;

  save(category: Category, options?: Options): Promise<Result<void>>;
}
