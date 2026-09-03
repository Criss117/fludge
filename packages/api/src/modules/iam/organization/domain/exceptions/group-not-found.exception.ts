import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class GroupNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "iam.groups.errors.not_found");
  }
}
