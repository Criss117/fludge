import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { OrganizationUniquenessValidator } from "@fludge/api/modules/iam/organization/application/services/organization-uniqueness-validator.service";

type Values = {
  slug?: string;
  taxId?: string;
  phone?: string;
  legalName?: string;
  name?: string;
};

type UniquenessResult = {
  legalNameTaken: boolean;
  nameTaken: boolean;
  phoneTaken: boolean;
  taxIdTaken: boolean;
  slugTaken: boolean;
};

const NOT_TAKEN: UniquenessResult = {
  legalNameTaken: false,
  nameTaken: false,
  phoneTaken: false,
  taxIdTaken: false,
  slugTaken: false,
};

/**
 * Test double de OrganizationUniquenessValidator.
 * No se testea este service; solo se usa para inyectar resultados
 * controlados en los commands que lo reciben.
 */
export class FakeOrganizationUniquenessValidator {
  public result: UniquenessResult = { ...NOT_TAKEN };
  public error: Error | null = null;

  public calls: Array<{ values: Values; excludeId?: string }> = [];

  public async validateUniqueFields(
    value: Values,
    excludeId?: string,
  ): Promise<Result<UniquenessResult, Error>> {
    this.calls.push({ values: value, excludeId });

    if (this.error) return err(this.error);

    return ok(this.result);
  }
}

// El command espera la clase concreta; el fake es estructuralmente compatible.
export type FakeValidator = InstanceType<typeof FakeOrganizationUniquenessValidator> &
  Pick<OrganizationUniquenessValidator, "validateUniqueFields">;