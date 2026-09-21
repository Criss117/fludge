import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CantChangeSaleStatusException extends BadRequestError {
  constructor(message: TranslationKey = "api_errors.sales.cant_change_status") {
    super(message);
  }
}
