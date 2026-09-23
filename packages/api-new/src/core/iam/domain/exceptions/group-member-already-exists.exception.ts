import { ConflictError } from "@core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class GroupMemberAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.iam.group_members.already_exists");
  }
}