import { describe, expect, it } from "bun:test";

import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import type { GroupSelect } from "@fludge/db/schema/iam.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildGroup(options?: { name?: string; permissions?: Permissions }) {
  const createdBy = UUID.generate();

  return Group.create({
    name: options?.name ?? "Ventas",
    description: "Equipo de ventas",
    permissions: options?.permissions ?? Permissions.fromList(["products:create"]),
    createdBy,
  });
}

function buildGroupSelect(): GroupSelect {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    name: "Ventas",
    slug: "ventas",
    description: "Equipo de ventas",
    permissions: ["products:create", "products:read"],
    organizationId: UUID.generate().toString(),
    createdBy: UUID.generate().toString(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe("Group.create", () => {
  it("creates a group with active status and slug from name", () => {
    const group = buildGroup({ name: "Equipo de Ventas" });

    expect(group.values.name).toBe("Equipo de Ventas");
    expect(group.values.slug).toBe("equipo-de-ventas");
    expect(group.values.description).toBe("Equipo de ventas");
    expect(group.values.status).toBe("active");
    expect(group.values.id).toBeTruthy();
    expect(group.values.createdAt).toBeInstanceOf(Date);
    expect(group.values.updatedAt).toBeInstanceOf(Date);
  });

  it("defaults description to empty string when not provided", () => {
    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: UUID.generate(),
    });

    expect(group.values.description).toBe("");
  });

  it("stores the createdBy member id", () => {
    const createdBy = UUID.generate();
    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy,
    });

    expect(group.values.createdBy).toBe(createdBy.toString());
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("Group.reconstitute", () => {
  it("rebuilds a group from select values", () => {
    const values = buildGroupSelect();
    const group = Group.reconstitute(values);

    expect(group.values.id).toBe(values.id);
    expect(group.values.name).toBe(values.name);
    expect(group.values.slug).toBe(values.slug);
    expect(group.values.description).toBe(values.description);
    expect(group.values.status).toBe(values.status);
    expect(group.values.permissions).toEqual(values.permissions);
  });
});

// ---------------------------------------------------------------------------
// nameIsTaken
// ---------------------------------------------------------------------------

describe("Group.nameIsTaken", () => {
  it("returns true when the name matches", () => {
    const group = buildGroup({ name: "Ventas" });

    expect(group.nameIsTaken("Ventas")).toBe(true);
  });

  it("returns true when the slug matches", () => {
    const group = buildGroup({ name: "Equipo de Ventas" });

    expect(group.nameIsTaken("equipo-de-ventas")).toBe(true);
  });

  it("returns false when neither name nor slug match", () => {
    const group = buildGroup({ name: "Ventas" });

    expect(group.nameIsTaken("Compras")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

describe("Group.update", () => {
  it("updates the name and regenerates the slug", () => {
    const group = buildGroup();

    group.update({ name: "Compras" });

    expect(group.values.name).toBe("Compras");
    expect(group.values.slug).toBe("compras");
  });

  it("updates description and permissions", () => {
    const group = buildGroup();
    const newPermissions = Permissions.fromList(["customers:create"]);

    group.update({ description: "Nueva descripción", permissions: newPermissions });

    expect(group.values.description).toBe("Nueva descripción");
    expect(group.values.permissions).toEqual(newPermissions.values);
  });

  it("updates the status", () => {
    const group = buildGroup();

    group.update({ status: "inactive" });

    expect(group.values.status).toBe("inactive");
  });

  it("touches the updatedAt timestamp", () => {
    const group = buildGroup();
    const before = group.values.updatedAt.getTime();

    group.update({ description: "cambio" });

    expect(group.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ---------------------------------------------------------------------------
// status transitions
// ---------------------------------------------------------------------------

describe("Group status transitions", () => {
  it("setInactive sets the status to inactive", () => {
    const group = buildGroup();

    group.setInactive();

    expect(group.status.isInactive()).toBe(true);
    expect(group.values.status).toBe("inactive");
  });

  it("setActive sets the status to active", () => {
    const group = buildGroup();
    group.setInactive();

    group.setActive();

    expect(group.status.isActive()).toBe(true);
  });

  it("toggleStatus toggles between active and inactive", () => {
    const group = buildGroup();

    group.toggleStatus();
    expect(group.status.isInactive()).toBe(true);

    group.toggleStatus();
    expect(group.status.isActive()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getters
// ---------------------------------------------------------------------------

describe("Group getters", () => {
  it("exposes id and permissions", () => {
    const group = buildGroup();

    expect(group.id).toBeInstanceOf(Object);
    expect(group.permissions.values).toContain("products:create");
  });
});