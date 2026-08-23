import { describe, expect, it } from "bun:test";
import { Permissions } from "@fludge/utils/permissions";
import { UUID } from "@fludge/utils/uuid";
import { Group } from "../src/modules/iam/organization/domain/entities/group.entity";
import { GroupCollection } from "../src/modules/iam/organization/domain/entities/group.collection";
import { GroupAlreadyExistsException } from "../src/modules/iam/organization/domain/exceptions/group-already-exists.exception";
import { GroupNotFoundException } from "../src/modules/iam/organization/domain/exceptions/group-not-found.exception";

const createGroup = (name = "Editors") => Group.create({ name, description: null, permissions: Permissions.empty(), createdBy: null });

describe("GroupCollection", () => {
  it("creates empty or initialized collections", () => {
    expect(GroupCollection.create().values(UUID.generate())).toEqual([]);
    const initialized = GroupCollection.create([{ name: "Editors", description: null, permissions: Permissions.empty(), createdBy: null }]);
    expect(initialized.values(UUID.generate())).toHaveLength(1);
  });
  it("adds groups and rejects duplicate IDs and names", () => {
    const collection = GroupCollection.create();
    const first = createGroup();
    collection.addGroup(first);
    expect(collection.getGroup(first.id)).toBe(first);
    expect(() => collection.addGroup(first)).toThrow(GroupAlreadyExistsException);
    expect(() => collection.addGroup(createGroup("EDITORS"))).toThrow(GroupAlreadyExistsException);
  });
  it("gets groups and reports name availability with exclusions", () => {
    const collection = GroupCollection.create();
    const first = createGroup();
    collection.addGroup(first);
    expect(collection.getGroup(UUID.generate())).toBeNull();
    expect(collection.groupNameIsAvailable("Viewers")).toBe(true);
    expect(collection.groupNameIsAvailable("EDITORS")).toBe(false);
    expect(collection.groupNameIsAvailable("EDITORS", first.id)).toBe(true);
  });
  it("updates, toggles, and removes groups", () => {
    const collection = GroupCollection.create();
    const first = createGroup();
    collection.addGroup(first);
    collection.updateGroup(first.id, { name: "Viewers" });
    expect(collection.getGroup(first.id)?.values.slug).toBe("viewers");
    collection.updateGroup(first.id, { toogleActive: true });
    expect(first.isActive).toBe(false);
    collection.updateGroup(first.id, { toogleActive: true });
    expect(first.isActive).toBe(true);
    collection.removeGroup(first.id);
    expect(collection.getGroup(first.id)).toBeNull();
    expect(() => collection.updateGroup(first.id, {})).toThrow(GroupNotFoundException);
    expect(() => collection.removeGroup(first.id)).toThrow(GroupNotFoundException);
  });
  it("rejects updating a group to an existing name", () => {
    const collection = GroupCollection.create();
    const first = createGroup("Editors");
    const second = createGroup("Viewers");
    collection.addGroup(first);
    collection.addGroup(second);

    expect(() => collection.updateGroup(first.id, { name: "Viewers" })).toThrow(
      GroupAlreadyExistsException,
    );
  });
});
