import { ConflictError } from "@core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class MemberAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.iam.members.already_exists");
  }
}