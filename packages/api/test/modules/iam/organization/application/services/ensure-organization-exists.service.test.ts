import { describe, expect, it, mock } from "bun:test";
import { EnsureOrganizationExistsService } from "@fludge/api/modules/iam/organization/application/services/ensure-organization-exists.service";
import { err } from "@fludge/utils/trycatch";

function makeDb(rows: unknown[] = [], error?: Error) {
  const chain: Record<string, any> = {
    from: mock(() => chain),
    innerJoin: mock(() => chain),
    where: mock(() => chain),
    limit: mock(() => chain),
    then: (resolve: (value: unknown[]) => unknown, reject?: (reason: Error) => unknown) =>
      error ? Promise.reject(error).catch(reject) : Promise.resolve(rows).then(resolve, reject),
  };

  return { select: mock(() => chain), chain };
}

describe("EnsureOrganizationExistsService", () => {
  it("returns true when an organization exists by id", async () => {
    const db = makeDb([{ id: "org-1" }]);
    const result = await new EnsureOrganizationExistsService(db as any).byId("org-1");

    expect(result).toEqual([true, null]);
    expect(db.chain.limit).toHaveBeenCalledWith(1);
  });

  it("returns false when no organization exists by id", async () => {
    const db = makeDb([]);
    const result = await new EnsureOrganizationExistsService(db as any).byId("missing");

    expect(result).toEqual([false, null]);
  });

  it("returns the lookup error for byId", async () => {
    const failure = new Error("database unavailable");
    const result = await new EnsureOrganizationExistsService(makeDb([], failure) as any).byId("org-1");

    expect(result).toEqual(err(failure));
  });

  it("returns true when the organization belongs to the user", async () => {
    const db = makeDb([{ id: "org-1" }]);
    const result = await new EnsureOrganizationExistsService(db as any).byIdAndUserId("org-1", "user-1");

    expect(result).toEqual([true, null]);
    expect(db.chain.innerJoin).toHaveBeenCalledTimes(1);
    expect(db.chain.limit).toHaveBeenCalledWith(1);
  });

  it("returns false when the user is not a member", async () => {
    const result = await new EnsureOrganizationExistsService(makeDb([]) as any).byIdAndUserId("org-1", "user-1");

    expect(result).toEqual([false, null]);
  });

  it("returns the lookup error for byIdAndUserId", async () => {
    const failure = new Error("database unavailable");
    const result = await new EnsureOrganizationExistsService(makeDb([], failure) as any).byIdAndUserId("org-1", "user-1");

    expect(result).toEqual(err(failure));
  });
});
