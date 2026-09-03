import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CantRemoveOwnerException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.iam.organizations.cant_remove_owner");
  }
}
