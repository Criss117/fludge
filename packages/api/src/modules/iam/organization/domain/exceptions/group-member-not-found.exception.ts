import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class GroupMemberNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.iam.group_members.not_found");
  }
}
