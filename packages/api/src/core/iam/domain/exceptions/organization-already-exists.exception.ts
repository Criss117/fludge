import { ConflictError } from "@core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class OrganizationAlreadyExistsException extends ConflictError {
  constructor(key?: TranslationKey) {
    super(key ?? "api_errors.iam.organizations.already_exists");
  }
}