import { describe, expect, it } from "bun:test";
import { UUID } from "@fludge/utils/uuid";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { MemberCollection } from "@fludge/api/modules/iam/organization/domain/entities/member.collection";
import { CantRemoveOwnerException } from "@fludge/api/modules/iam/organization/domain/exceptions/cant-remove-owner.exception";
import { MemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-already-exists.exception";
import { MemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-not-found.exeption";

const createMember = (role: "member" | "owner" = "member") =>
  Member.create({ userId: UUID.generate(), assignedBy: null, role });

describe("MemberCollection", () => {
  it("creates empty or initialized collections and adds members", () => {
    const empty = MemberCollection.create();
    expect(empty.values(UUID.generate())).toEqual([]);
    const owner = createMember("owner");
    const collection = MemberCollection.create([
      { userId: UUID.generate(), assignedBy: null, role: "member" },
    ]);
    collection.addMember(owner);
    expect(collection.getMember(owner.id)).toBe(owner);
    expect(collection.values(UUID.generate())).toHaveLength(2);
  });
  it("enforces unique IDs and a single owner", () => {
    const collection = MemberCollection.create();
    const owner = createMember("owner");
    collection.addMember(owner);
    expect(() => collection.addMember(owner)).toThrow(
      MemberAlreadyExistsException,
    );
    expect(() => collection.addMember(createMember("owner"))).toThrow(
      MemberAlreadyExistsException,
    );
    expect(collection.owner).toBe(owner);
  });
  it("returns null when the collection has no owner", () => {
    const collection = MemberCollection.create([
      { userId: UUID.generate(), assignedBy: null, role: "member" },
    ]);

    expect(collection.owner).toBeNull();
  });
  it("finds by ID or user ID and removes regular members only", () => {
    const collection = MemberCollection.create();
    const regular = createMember();
    const owner = createMember("owner");
    collection.addMember(regular);
    collection.addMember(owner);
    expect(collection.getMemberByUserId(regular.userId)).toBe(regular);
    expect(collection.getMemberByUserId(UUID.generate())).toBeNull();
    collection.removeMember(regular.id);
    expect(collection.getMember(regular.id)).toBeNull();
    expect(() => collection.removeMember(owner.id)).toThrow(
      CantRemoveOwnerException,
    );
    expect(() => collection.removeMember(UUID.generate())).toThrow(
      MemberNotFoundException,
    );
  });
});
