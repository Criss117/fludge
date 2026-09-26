import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  seedAllValidator,
  seedCatalogValidator,
  seedCommerceValidator,
  seedIamValidator,
  seedUsersValidator,
} from "../../src/validators/seed.validators";

function expectParsed<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
) {
  const result = schema.safeParse(value);
  expect(result.success, `expected success for ${JSON.stringify(value)}`).toBe(
    true,
  );
  if (!result.success) {
    throw new Error(`expected success but got: ${result.error.message}`);
  }
  return result.data;
}

function expectFirstIssue<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
): string {
  const result = schema.safeParse(value);
  expect(result.success, `expected failure for ${JSON.stringify(value)}`).toBe(
    false,
  );
  if (result.success) {
    throw new Error(`expected failure for ${JSON.stringify(value)}`);
  }
  return result.error.issues[0]?.message ?? "";
}

describe("seedUsersValidator", () => {
  it("applies the default of 2 root users when omitted", () => {
    expect(expectParsed(seedUsersValidator, {}).rootUsers).toBe(2);
  });

  it("accepts an explicit non-negative integer", () => {
    expect(expectParsed(seedUsersValidator, { rootUsers: 0 }).rootUsers).toBe(0);
    expect(expectParsed(seedUsersValidator, { rootUsers: 25 }).rootUsers).toBe(
      25,
    );
  });

  it("rejects negative values", () => {
    expect(expectFirstIssue(seedUsersValidator, { rootUsers: -1 })).toMatch(
      /expected number to be >=0/,
    );
  });

  it("rejects non-integer numbers", () => {
    expect(expectFirstIssue(seedUsersValidator, { rootUsers: 1.5 })).toMatch(
      /expected int/,
    );
  });

  it("rejects non-number values", () => {
    expect(expectFirstIssue(seedUsersValidator, { rootUsers: "2" })).toMatch(
      /expected number/,
    );
  });
});

describe("seedIamValidator", () => {
  it("applies defaults for every field when omitted", () => {
    const data = expectParsed(seedIamValidator, {});
    expect(data.organizationsPerRoot).toBe(2);
    expect(data.membersPerOrganization).toBe(10);
    expect(data.groupPerOrganization).toBe(10);
  });

  it("accepts valid explicit values at the boundaries", () => {
    const data = expectParsed(seedIamValidator, {
      organizationsPerRoot: 1,
      membersPerOrganization: 0,
      groupPerOrganization: 0,
    });
    expect(data.organizationsPerRoot).toBe(1);
    expect(data.membersPerOrganization).toBe(0);
    expect(data.groupPerOrganization).toBe(0);
  });

  it("rejects organizationsPerRoot below the minimum of 1", () => {
    expect(expectFirstIssue(seedIamValidator, { organizationsPerRoot: 0 })).toMatch(
      /expected number to be >=1/,
    );
  });

  it("rejects negative membersPerOrganization and groupPerOrganization", () => {
    expect(expectFirstIssue(seedIamValidator, { membersPerOrganization: -1 })).toMatch(
      /expected number to be >=0/,
    );
    expect(expectFirstIssue(seedIamValidator, { groupPerOrganization: -1 })).toMatch(
      /expected number to be >=0/,
    );
  });

  it("rejects non-integer values", () => {
    expect(expectFirstIssue(seedIamValidator, { organizationsPerRoot: 1.5 })).toMatch(
      /expected int/,
    );
  });
});

describe("seedCatalogValidator", () => {
  it("applies defaults for every field when omitted", () => {
    const data = expectParsed(seedCatalogValidator, {});
    expect(data.categoriesPerOrganization).toBe(10);
    expect(data.productsPerOrganization).toBe(100);
    expect(data.presentationsPerProduct).toBe(5);
  });

  it("accepts zeros where allowed", () => {
    const data = expectParsed(seedCatalogValidator, {
      categoriesPerOrganization: 0,
      productsPerOrganization: 0,
    });
    expect(data.categoriesPerOrganization).toBe(0);
    expect(data.productsPerOrganization).toBe(0);
  });

  it("rejects presentationsPerProduct below the minimum of 1", () => {
    expect(expectFirstIssue(seedCatalogValidator, { presentationsPerProduct: 0 })).toMatch(
      /expected number to be >=1/,
    );
  });

  it("rejects negative values", () => {
    expect(expectFirstIssue(seedCatalogValidator, { productsPerOrganization: -1 })).toMatch(
      /expected number to be >=0/,
    );
  });

  it("rejects non-number values", () => {
    expect(expectFirstIssue(seedCatalogValidator, { categoriesPerOrganization: "10" })).toMatch(
      /expected number/,
    );
  });
});

describe("seedCommerceValidator", () => {
  it("applies defaults for every field when omitted", () => {
    const data = expectParsed(seedCommerceValidator, {});
    expect(data.customersPerOrganization).toBe(20);
    expect(data.salesPerCustomer).toBe(20);
    expect(data.itemsPerSale).toBe(20);
  });

  it("accepts zeros where allowed", () => {
    const data = expectParsed(seedCommerceValidator, {
      customersPerOrganization: 0,
      salesPerCustomer: 0,
    });
    expect(data.customersPerOrganization).toBe(0);
    expect(data.salesPerCustomer).toBe(0);
  });

  it("rejects itemsPerSale below the minimum of 1", () => {
    expect(expectFirstIssue(seedCommerceValidator, { itemsPerSale: 0 })).toMatch(
      /expected number to be >=1/,
    );
  });

  it("rejects negative values", () => {
    expect(expectFirstIssue(seedCommerceValidator, { salesPerCustomer: -1 })).toMatch(
      /expected number to be >=0/,
    );
  });
});

describe("seedAllValidator", () => {
  it("rejects an empty object (every section is required)", () => {
    expect(expectFirstIssue(seedAllValidator, {})).toMatch(/expected object/);
  });

  it("applies nested defaults when every section is an empty object", () => {
    const data = expectParsed(seedAllValidator, {
      users: {},
      iam: {},
      catalog: {},
      commerce: {},
    });
    expect(data.users.rootUsers).toBe(2);
    expect(data.iam.organizationsPerRoot).toBe(2);
    expect(data.catalog.categoriesPerOrganization).toBe(10);
    expect(data.commerce.customersPerOrganization).toBe(20);
  });

  it("accepts explicit overrides per section", () => {
    const data = expectParsed(seedAllValidator, {
      users: { rootUsers: 6 },
      iam: { organizationsPerRoot: 3 },
      catalog: { presentationsPerProduct: 7 },
      commerce: { itemsPerSale: 4 },
    });
    expect(data.users.rootUsers).toBe(6);
    expect(data.iam.organizationsPerRoot).toBe(3);
    expect(data.catalog.presentationsPerProduct).toBe(7);
    expect(data.commerce.itemsPerSale).toBe(4);
  });

  it("rejects an invalid value inside a nested section", () => {
    expect(expectFirstIssue(seedAllValidator, {
      users: { rootUsers: -1 },
      iam: {},
      catalog: {},
      commerce: {},
    })).toMatch(/expected number to be >=0/);
  });
});