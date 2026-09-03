import { ConflictError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class GroupAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "iam.groups.errors.already_exists");
  }
}
