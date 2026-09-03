import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class GroupMemberNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "iam.group_members.errors.not_found");
  }
}
