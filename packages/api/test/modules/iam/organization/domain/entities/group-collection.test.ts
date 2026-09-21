import { describe, expect, it } from "bun:test";

import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { GroupCollection } from "@fludge/api/modules/iam/organization/domain/entities/group.collection";
import { GroupAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-already-exists.exception";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import type { GroupSelect } from "@fludge/db/schema/iam.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildGroup(options?: { name?: string }) {
  return Group.create({
    name: options?.name ?? "Ventas",
    permissions: Permissions.fromList(["products:create"]),
    createdBy: UUID.generate(),
  });
}

function buildGroupSelect(name = "Ventas"): GroupSelect {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    name,
    slug: "ventas",
    description: "",
    permissions: ["products:create", "products:read"],
    organizationId: UUID.generate().toString(),
    createdBy: UUID.generate().toString(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// create / reconstitute
// ---------------------------------------------------------------------------

describe("GroupCollection.create", () => {
  it("creates an empty collection when no values are provided", () => {
    const collection = GroupCollection.create();

    expect(collection.all).toHaveLength(0);
  });

  it("creates a collection from group definitions", () => {
    const collection = GroupCollection.create([
      {
        name: "Ventas",
        permissions: Permissions.fromList(["products:create"]),
        createdBy: UUID.generate(),
      },
      {
        name: "Compras",
        permissions: Permissions.fromList(["products:read"]),
        createdBy: UUID.generate(),
      },
    ]);

    expect(collection.all).toHaveLength(2);
  });
});

describe("GroupCollection.reconstitute", () => {
  it("rebuilds a collection from select values", () => {
    const collection = GroupCollection.reconstitute([
      buildGroupSelect("Ventas"),
      buildGroupSelect("Compras"),
    ]);

    expect(collection.all).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// addGroup
// ---------------------------------------------------------------------------

describe("GroupCollection.addGroup", () => {
  it("adds a group to the collection", () => {
    const collection = GroupCollection.create();
    const group = buildGroup();

    collection.addGroup(group);

    expect(collection.all).toHaveLength(1);
    expect(collection.getGroup(group.id)).not.toBeNull();
  });

  it("throws GroupAlreadyExistsException when the group id already exists", () => {
    const collection = GroupCollection.create();
    const group = buildGroup();

    collection.addGroup(group);

    expect(() => collection.addGroup(group)).toThrow(GroupAlreadyExistsException);
  });

  it("throws GroupAlreadyExistsException when the name is already taken", () => {
    const collection = GroupCollection.create();
    const groupA = buildGroup({ name: "Ventas" });
    const groupB = buildGroup({ name: "Ventas" });

    collection.addGroup(groupA);

    expect(() => collection.addGroup(groupB)).toThrow(GroupAlreadyExistsException);
  });
});

// ---------------------------------------------------------------------------
// getGroup / groupNameIsAvailable
// ---------------------------------------------------------------------------

describe("GroupCollection.getGroup", () => {
  it("returns the group when found", () => {
    const collection = GroupCollection.create();
    const group = buildGroup();
    collection.addGroup(group);

    expect(collection.getGroup(group.id)!.id.equals(group.id)).toBe(true);
  });

  it("returns null when the group does not exist", () => {
    const collection = GroupCollection.create();

    expect(collection.getGroup(UUID.generate())).toBeNull();
  });
});

describe("GroupCollection.groupNameIsAvailable", () => {
  it("returns true when the name is available", () => {
    const collection = GroupCollection.create();
    const group = buildGroup({ name: "Ventas" });
    collection.addGroup(group);

    expect(collection.groupNameIsAvailable("Compras")).toBe(true);
  });

  it("returns false when the name is taken", () => {
    const collection = GroupCollection.create();
    const group = buildGroup({ name: "Ventas" });
    collection.addGroup(group);

    expect(collection.groupNameIsAvailable("Ventas")).toBe(false);
  });

  it("returns true for the same group when excluded by id", () => {
    const collection = GroupCollection.create();
    const group = buildGroup({ name: "Ventas" });
    collection.addGroup(group);

    expect(collection.groupNameIsAvailable("Ventas", group.id)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateGroup
// ---------------------------------------------------------------------------

describe("GroupCollection.updateGroup", () => {
  it("updates an existing group and returns it", () => {
    const collection = GroupCollection.create();
    const group = buildGroup({ name: "Ventas" });
    collection.addGroup(group);

    const updated = collection.updateGroup(group.id, { name: "Compras" });

    expect(updated.values.name).toBe("Compras");
    expect(collection.getGroup(group.id)!.values.name).toBe("Compras");
  });

  it("throws GroupNotFoundException when the group does not exist", () => {
    const collection = GroupCollection.create();

    expect(() => collection.updateGroup(UUID.generate(), { name: "X" })).toThrow(
      GroupNotFoundException,
    );
  });

  it("throws GroupAlreadyExistsException when the new name is taken by another group", () => {
    const collection = GroupCollection.create();
    const groupA = buildGroup({ name: "Ventas" });
    const groupB = buildGroup({ name: "Compras" });
    collection.addGroup(groupA);
    collection.addGroup(groupB);

    expect(() => collection.updateGroup(groupB.id, { name: "Ventas" })).toThrow(
      GroupAlreadyExistsException,
    );
  });
});

// ---------------------------------------------------------------------------
// disableGroup / enableGroup
// ---------------------------------------------------------------------------

describe("GroupCollection.disableGroup / enableGroup", () => {
  it("disables an existing group", () => {
    const collection = GroupCollection.create();
    const group = buildGroup();
    collection.addGroup(group);

    collection.disableGroup(group.id);

    expect(collection.getGroup(group.id)!.status.isInactive()).toBe(true);
  });

  it("enables an existing group", () => {
    const collection = GroupCollection.create();
    const group = buildGroup();
    collection.addGroup(group);
    collection.disableGroup(group.id);

    collection.enableGroup(group.id);

    expect(collection.getGroup(group.id)!.status.isActive()).toBe(true);
  });

  it("throws GroupNotFoundException when disabling a missing group", () => {
    const collection = GroupCollection.create();

    expect(() => collection.disableGroup(UUID.generate())).toThrow(
      GroupNotFoundException,
    );
  });

  it("throws GroupNotFoundException when enabling a missing group", () => {
    const collection = GroupCollection.create();

    expect(() => collection.enableGroup(UUID.generate())).toThrow(
      GroupNotFoundException,
    );
  });
});

// ---------------------------------------------------------------------------
// removeGroup
// ---------------------------------------------------------------------------

describe("GroupCollection.removeGroup", () => {
  it("removes an existing group and returns it", () => {
    const collection = GroupCollection.create();
    const group = buildGroup();
    collection.addGroup(group);

    const removed = collection.removeGroup(group.id);

    expect(removed.id.equals(group.id)).toBe(true);
    expect(collection.all).toHaveLength(0);
  });

  it("throws GroupNotFoundException when the group does not exist", () => {
    const collection = GroupCollection.create();

    expect(() => collection.removeGroup(UUID.generate())).toThrow(
      GroupNotFoundException,
    );
  });
});

// ---------------------------------------------------------------------------
// values
// ---------------------------------------------------------------------------

describe("GroupCollection.values", () => {
  it("serializes groups with the organizationId", () => {
    const collection = GroupCollection.create();
    const group = buildGroup();
    collection.addGroup(group);
    const organizationId = UUID.generate();

    const values = collection.values(organizationId);

    expect(values).toHaveLength(1);
    expect(values[0]!.organizationId).toBe(organizationId.toString());
    expect(values[0]!.name).toBe(group.values.name);
  });
});