import { NotFoundError } from "@fludge/api/core/shared/exceptions/base-exception";
import { getI18nKey } from "@fludge/utils/validators/shared";
import type { TranslationKey } from "@fludge/i18n/index";

export class OrganizationNotFoundException extends NotFoundError {
  constructor(key?: TranslationKey) {
    super(getI18nKey(key ?? "api_errors.iam.organizations.not_found"));
  }
}
