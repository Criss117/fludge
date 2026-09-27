import { ok } from "@fludge/utils/trycatch";

type UniqueValues = {
  name?: string;
  slug?: string;
  legalName?: string;
  taxId?: string;
  phone?: string;
};

/**
 * In-memory stand-in for `OrganizationUniquenessValidator`.
 * The command constructors type the validator parameter with the real class,
 * so this concrete class mimics its `validateUniqueFields` contract instead of
 * implementing an interface. Use `markTaken` to simulate existing records.
 */
export class InMemoryOrganizationUniquenessValidator {
  private takenNames = new Set<string>();
  private takenSlugs = new Set<string>();
  private takenLegalNames = new Set<string>();
  private takenTaxIds = new Set<string>();
  private takenPhones = new Set<string>();

  markTaken(values: UniqueValues) {
    if (values.name) this.takenNames.add(values.name);
    if (values.slug) this.takenSlugs.add(values.slug);
    if (values.legalName) this.takenLegalNames.add(values.legalName);
    if (values.taxId) this.takenTaxIds.add(values.taxId);
    if (values.phone) this.takenPhones.add(values.phone);
  }

  async validateUniqueFields(value: UniqueValues, _excludeId?: string) {
    return ok({
      nameTaken: value.name ? this.takenNames.has(value.name) : false,
      slugTaken: value.slug ? this.takenSlugs.has(value.slug) : false,
      legalNameTaken: value.legalName
        ? this.takenLegalNames.has(value.legalName)
        : false,
      taxIdTaken: value.taxId ? this.takenTaxIds.has(value.taxId) : false,
      phoneTaken: value.phone ? this.takenPhones.has(value.phone) : false,
    });
  }
}