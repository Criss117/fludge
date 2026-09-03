import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class MemberIsOwnerException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.iam.members.is_owner");
  }
}
