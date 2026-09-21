import { err, ok, type Result } from "@fludge/utils/trycatch";

type Values = {
  slug?: string;
  name?: string;
};

type UniquenessResult = {
  nameTaken: boolean;
  slugTaken: boolean;
};

const NOT_TAKEN: UniquenessResult = {
  nameTaken: false,
  slugTaken: false,
};

/**
 * Test double de CategoryUniquenessValidator.
 * No se testea este service; solo se usa para inyectar resultados
 * controlados en los commands que lo reciben.
 */
export class FakeCategoryUniquenessValidator {
  public result: UniquenessResult = { ...NOT_TAKEN };
  public error: Error | null = null;

  public calls: Array<{ organizationId: string; values: Values; excludeId?: string }> = [];

  public async validateUniqueFields(
    organizationId: string,
    value: Values,
    excludeId?: string,
  ): Promise<Result<UniquenessResult, Error>> {
    this.calls.push({ organizationId, values: value, excludeId });

    if (this.error) return err(this.error);

    return ok(this.result);
  }
}