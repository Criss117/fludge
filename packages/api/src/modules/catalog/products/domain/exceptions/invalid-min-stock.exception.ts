import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class InvalidMinStockException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(message ?? "catalog.products.errors.invalid_min_stock");
  }
}
