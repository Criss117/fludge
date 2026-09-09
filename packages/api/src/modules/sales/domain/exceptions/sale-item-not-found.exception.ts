import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class SaleItemNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.sales.sale_items.not_found");
  }
}
