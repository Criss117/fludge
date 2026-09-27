import { ok } from "@fludge/utils/trycatch";

type UniqueValues = {
  name?: string;
  slug?: string;
};

/**
 * In-memory stand-in for `GroupUniquenessValidator`.
 * The command constructors type the validator parameter with the real class,
 * so this concrete class mimics its `validateUniqueFields` contract instead of
 * implementing an interface. Use `markTaken` to simulate existing records.
 */
export class InMemoryGroupUniquenessValidator {
  private takenNames = new Set<string>();
  private takenSlugs = new Set<string>();

  markTaken(values: UniqueValues) {
    if (values.name) this.takenNames.add(values.name);
    if (values.slug) this.takenSlugs.add(values.slug);
  }

  async validateUniqueFields(
    _organizationId: string,
    value: UniqueValues,
    _excludeId?: string,
  ) {
    return ok({
      nameTaken: value.name ? this.takenNames.has(value.name) : false,
      slugTaken: value.slug ? this.takenSlugs.has(value.slug) : false,
    });
  }
}