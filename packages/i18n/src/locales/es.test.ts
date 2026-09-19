import { createHash } from "node:crypto";
import { describe, expect, it } from "bun:test";
import { es } from "./es";

const protectedDivisionHashes = {
  api_errors:
    "d541495ba561115874e4352c85d30b18cd1335cc1382be7b3755fb5fbae58eba",
  validators:
    "f4d87bf601bfdf328cfa7c9ab26d9243627337d41902a67b4cb6481ba6e38144",
  permissions:
    "11c9dcf79ef77d75afcdafa501170237a6f77691bdf21ac645e09f24132d2d3e",
} as const;

function getTranslation(path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, segment) => (value as Record<string, unknown>)[segment],
      es,
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
