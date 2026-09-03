import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class MemberNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "iam.members.errors.not_found");
  }
}
