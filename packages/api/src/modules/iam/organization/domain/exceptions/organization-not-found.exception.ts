import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { getI18nKey } from "@fludge/api/modules/shared/i18n/utils";
import type { TranslationKey } from "@fludge/i18n/index";

export class OrganizationNotFoundException extends NotFoundError {
  constructor(key?: TranslationKey) {
    super(getI18nKey(key ?? "api_errors.iam.organizations.not_found"));
  }
}
