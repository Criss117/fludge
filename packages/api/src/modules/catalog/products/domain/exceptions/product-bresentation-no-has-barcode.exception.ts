import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class ProductPresentationNoHasBarcodeException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.catalog.products.no_has_barcode");
  }
}
