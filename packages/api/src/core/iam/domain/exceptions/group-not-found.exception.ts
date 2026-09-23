import { NotFoundError } from "../../../shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class GroupNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.iam.groups.not_found");
  }
}