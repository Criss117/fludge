import { describe, expect, it } from "bun:test";
import { Permissions } from "@fludge/utils/permissions/index";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";

const group = (name = "Editors") =>
  Group.create({
    name,
    description: "A group",
    permissions: Permissions.create(["groups:read"]),
    createdBy: null,
  });

describe("Group", () => {
  it("creates with a slug and permissions", () => {
    const created = group("Content Editors");
    expect(created.values.slug).toBe("content-editors");
    expect(created.permissions.hasPermission("groups:read")).toBe(true);
    expect(created.status.isActive()).toBe(true);
  });
  it("detects exact and slug-equivalent names but not different names", () => {
    const created = group("Editors");
    expect(created.nameIsTaken("Editors")).toBe(true);
    expect(created.nameIsTaken("EDITORS")).toBe(true);
    expect(created.nameIsTaken("Viewers")).toBe(false);
  });
  it("updates name and permissions", () => {
    const created = group();
    const permissions = Permissions.create(["groups:delete"]);
    created.update({ name: "Viewers", permissions });
    expect(created.values.name).toBe("Viewers");
    expect(created.values.slug).toBe("viewers");
    expect(created.permissions.hasPermission("groups:delete")).toBe(true);
  });
  it("enables and disables idempotently", () => {
    const created = group();
    created.setInactive();
    expect(created.status.isInactive()).toBe(true);
    created.setActive();
    expect(created.status.isActive()).toBe(true);
  });
});
