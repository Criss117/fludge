import { describe, expect, it, mock } from "bun:test";
import { FindAllOrganizationsQuery } from "@fludge/api/modules/iam/organization/application/queries/find-all-organizations.query";
import { err, type Result } from "@fludge/utils/trycatch";

function makeDb(chainResult: Result<unknown[], Error>) {
  const chain: Record<string, any> = {};
  for (const method of ["from", "innerJoin", "where", "orderBy", "groupBy"]) chain[method] = mock(() => chain);
  chain.then = (resolve: (value: unknown[]) => unknown, reject?: (reason: Error) => unknown) => Promise.resolve(chainResult).then((result) => result[1] ? Promise.reject(result[1]) : resolve(result[0]), reject);
  return { select: mock(() => chain) };
}

describe("FindAllOrganizationsQuery", () => {
  it("returns all organizations for the logged user", async () => {
    const rows = [{ id: "org-1", name: "Acme" }, { id: "org-2", name: "Globex" }];
    const db = makeDb([rows, null]);
    const result = await new FindAllOrganizationsQuery(db as any).execute("user-1");
    expect(result).toBe(rows);
    expect(db.select).toHaveBeenCalledTimes(1);
  });
  it("throws INTERNAL_SERVER_ERROR when the query chain rejects", async () => {
    const db = makeDb(err(new Error("boom")) as any);
    await expect(new FindAllOrganizationsQuery(db as any).execute("user-1")).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener organizaciones" });
  });
});
