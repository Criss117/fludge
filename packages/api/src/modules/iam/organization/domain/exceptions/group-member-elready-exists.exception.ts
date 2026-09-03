import { ConflictError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class GroupMemberAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "iam.group_members.errors.already_exists");
  }
}
