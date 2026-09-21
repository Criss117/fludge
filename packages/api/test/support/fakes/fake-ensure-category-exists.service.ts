import { err, ok, type Result } from "@fludge/utils/trycatch";

/**
 * Test double de EnsureCategoryExistsService.
 * No se testea este service; solo se usa para inyectar resultados
 * controlados en los commands que lo reciben.
 */
export class FakeEnsureCategoryExistsService {
  public exists = true;
  public error: Error | null = null;

  public calls: Array<{ organizationId: string; categoryIds: string[] }> = [];

  public async validate(
    organizationId: string,
    categoryIds: string | string[],
  ): Promise<Result<boolean, Error>> {
    const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

    this.calls.push({ organizationId, categoryIds: ids });

    if (this.error) return err(this.error);

    return ok(this.exists);
  }
}