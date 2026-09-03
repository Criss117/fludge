import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class OwnerNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.iam.organizations.owner_not_found");
  }
}
