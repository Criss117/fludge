import { describe, expect, it, mock } from "bun:test";
import { OrganizationUniquenessValidator } from "@fludge/api/modules/iam/organization/application/services/organization-uniqueness-validator.service";
import { err } from "@fludge/utils/trycatch";

function makeDb(rows: unknown[] = [], error?: Error) {
  const chain: Record<string, any> = {
    from: mock(() => chain),
    where: mock(() => chain),
    then: (resolve: (value: unknown[]) => unknown, reject?: (reason: Error) => unknown) =>
      error ? Promise.reject(error).catch(reject) : Promise.resolve(rows).then(resolve, reject),
  };

  return { select: mock(() => chain), chain };
}

describe("OrganizationUniquenessValidator", () => {
  it("returns no conflicts without querying when all values are empty", async () => {
    const db = makeDb();
    const result = await new OrganizationUniquenessValidator(db as any).validateUniqueFields({});

    expect(result).toEqual([
      {
        legalNameTaken: false,
        nameTaken: false,
        phoneTaken: false,
        taxIdTaken: false,
        slugTaken: false,
      },
      null,
    ]);
    expect(db.select).not.toHaveBeenCalled();
  });

  it("marks each matching field as taken", async () => {
    const value = {
      legalName: "Acme LLC",
      name: "Acme",
      phone: "555-0100",
      taxId: "TAX-1",
      slug: "acme",
    };
    const db = makeDb([{ ...value }]);

    const result = await new OrganizationUniquenessValidator(db as any).validateUniqueFields(value);

    expect(result).toEqual([
      {
        legalNameTaken: true,
        nameTaken: true,
        phoneTaken: true,
        taxIdTaken: true,
        slugTaken: true,
      },
      null,
    ]);
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it("only marks fields that match returned rows", async () => {
    const db = makeDb([
      { legalName: "Other LLC", name: "Acme", phone: "555-9999", taxId: "TAX-2", slug: "other" },
    ]);

    const result = await new OrganizationUniquenessValidator(db as any).validateUniqueFields({
      legalName: "Acme LLC",
      name: "Acme",
      phone: "555-0100",
      taxId: "TAX-1",
      slug: "acme",
    });

    expect(result).toEqual([
      {
        legalNameTaken: false,
        nameTaken: true,
        phoneTaken: false,
        taxIdTaken: false,
        slugTaken: false,
      },
      null,
    ]);
  });

  it("returns the database error instead of throwing", async () => {
    const failure = new Error("database unavailable");
    const db = makeDb([], failure);

    const result = await new OrganizationUniquenessValidator(db as any).validateUniqueFields({ name: "Acme" });

    expect(result).toEqual(err(failure));
  });
});
