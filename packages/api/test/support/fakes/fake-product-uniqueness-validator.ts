import { err, ok, type Result } from "@fludge/utils/trycatch";

type Values = {
  slug?: string;
  name?: string;
};

type UniquenessResult = {
  nameTaken: boolean;
  slugTaken: boolean;
};

type BarcodeResult = {
  barcodesTaken: boolean;
};

const NOT_TAKEN: UniquenessResult = {
  nameTaken: false,
  slugTaken: false,
};

const NOT_TAKEN_BARCODE: BarcodeResult = {
  barcodesTaken: false,
};

/**
 * Test double de ProductUniquenessValidator.
 * No se testea este service; solo se usa para inyectar resultados
 * controlados en los commands que lo reciben.
 */
export class FakeProductUniquenessValidator {
  public result: UniquenessResult = { ...NOT_TAKEN };
  public barcodeResult: BarcodeResult = { ...NOT_TAKEN_BARCODE };
  public error: Error | null = null;
  public barcodeError: Error | null = null;

  public calls: Array<{ organizationId: string; values: Values; excludeId?: string }> = [];
  public barcodeCalls: Array<{
    organizationId: string;
    barcodes: string[];
    excludeIds?: string[];
  }> = [];

  public async validateUniqueFields(
    organizationId: string,
    value: Values,
    excludeId?: string,
  ): Promise<Result<UniquenessResult, Error>> {
    this.calls.push({ organizationId, values: value, excludeId });

    if (this.error) return err(this.error);

    return ok(this.result);
  }

  public async validateUniqueBarcode(
    organizationId: string,
    barcodes: string | string[],
    excludeIds?: string | string[],
  ): Promise<Result<BarcodeResult, Error>> {
    this.barcodeCalls.push({
      organizationId,
      barcodes: Array.isArray(barcodes) ? barcodes : [barcodes],
      excludeIds: excludeIds
        ? Array.isArray(excludeIds)
          ? excludeIds
          : [excludeIds]
        : undefined,
    });

    if (this.barcodeError) return err(this.barcodeError);

    return ok(this.barcodeResult);
  }
}