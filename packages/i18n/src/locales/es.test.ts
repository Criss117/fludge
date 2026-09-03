import { createHash } from "node:crypto";
import { describe, expect, it } from "bun:test";
import { es } from "./es";

const protectedDivisionHashes = {
  api_errors: "88e14b28632d74bc011b2eeba81797acbe574d694f5239c481350ae8b5a3bba5",
  validators: "bc608b5f9371cd0d479b0311d5b8e7a4da72b3c537fce1eab564619d9d2998a6",
  permissions: "07b464b19a7e08131f03e60fa58dcfbf655e651d925366fcbedb3506c638436d",
} as const;

function getTranslation(path: string): unknown {
  return path.split(".").reduce<unknown>(
    (value, segment) => (value as Record<string, unknown>)[segment],
    es
  );
}

describe("Spanish dictionary native contracts", () => {
  it("contains every native form and extracted UI key", () => {
    const requiredKeys = [
      "forms.group.submit",
      "screens.members.register_member.credentials",
      "screens.members.register_member.personal_info",
      "screens.members.register_member.submit",
      "screens.organizations.register_organization.commercial_data",
      "screens.organizations.register_organization.location_contact",
      "screens.organizations.register_organization.submit",
      "screens.organizations.register_organization.cancel",
      "screens.groups.update_group.submit",
      "mutations.groups.update.is_pending",
      "mutations.groups.update.success.title",
      "mutations.groups.update.success.description",
      "mutations.groups.update.error",
      "helpers.status.activate",
      "helpers.status.deactivate",
    ];

    for (const key of requiredKeys) {
      expect(getTranslation(key), key).toEqual(expect.any(String));
      expect(getTranslation(key), key).not.toBe("");
    }

    expect(es.forms.group.submit).not.toBe(es.forms.group.create);
    expect(JSON.stringify(es)).not.toContain("recursos");
  });

  it("preserves protected dictionary divisions", () => {
    for (const division of Object.keys(protectedDivisionHashes) as Array<
      keyof typeof protectedDivisionHashes
    >) {
      const hash = createHash("sha256")
        .update(JSON.stringify(es[division]))
        .digest("hex");

      expect(hash).toBe(protectedDivisionHashes[division]);
    }
  });
});
