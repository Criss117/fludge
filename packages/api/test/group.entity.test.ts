import { describe, expect, it } from "bun:test";
import { Permissions } from "@fludge/utils/permissions";
import { Group } from "../src/modules/iam/organization/domain/entities/group.entity";

const group = (name = "Editors") => Group.create({ name, description: "A group", permissions: Permissions.create({ groups: ["read"] }), createdBy: null });

describe("Group", () => {
  it("creates with a slug and permissions", () => {
    const created = group("Content Editors");
    expect(created.values.slug).toBe("content-editors");
    expect(created.permissions.has("groups", "read")).toBe(true);
    expect(created.isActive).toBe(true);
  });
  it("detects exact and slug-equivalent names but not different names", () => {
    const created = group("Editors");
    expect(created.nameIsTaken("Editors")).toBe(true);
    expect(created.nameIsTaken("EDITORS")).toBe(true);
    expect(created.nameIsTaken("Viewers")).toBe(false);
  });
  it("updates name and permissions", () => {
    const created = group();
    const permissions = Permissions.create({ groups: ["delete"] });
    created.update({ name: "Viewers", permissions });
    expect(created.values.name).toBe("Viewers");
    expect(created.values.slug).toBe("viewers");
    expect(created.permissions.has("groups", "delete")).toBe(true);
  });
  it("enables and disables idempotently", () => {
    const created = group();
    created.disable();
    expect(created.isActive).toBe(false);
    const deletedAt = created.values.deletedAt;
    created.disable();
    expect(created.values.deletedAt).toBe(deletedAt);
    created.enable();
    expect(created.isActive).toBe(true);
    created.enable();
    expect(created.values.deletedAt).toBeNull();
  });
});
