import { ConflictError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class OrganizationAlreadyExistsException extends ConflictError {
  constructor(key?: TranslationKey) {
    super(key ?? "api_errors.iam.organizations.already_exists");
  }
}
