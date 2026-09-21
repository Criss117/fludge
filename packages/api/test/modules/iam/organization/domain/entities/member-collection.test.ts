import { describe, expect, it } from "bun:test";

import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { MemberCollection } from "@fludge/api/modules/iam/organization/domain/entities/member.collection";
import { MemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-already-exists.exception";
import { MemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-not-found.exeption";
import { CantRemoveOwnerException } from "@fludge/api/modules/iam/organization/domain/exceptions/cant-remove-owner.exception";
import { UUID } from "@fludge/utils/uuid";
import type { MemberSelect } from "@fludge/db/schema/iam.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMember(options?: { role?: "owner" | "member"; userId?: UUID }) {
  return Member.create({
    userId: options?.userId ?? UUID.generate(),
    assignedBy: options?.role === "owner" ? null : UUID.generate(),
    role: options?.role ?? "member",
  });
}

function buildMemberSelect(role: "owner" | "member" = "member"): MemberSelect {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    userId: UUID.generate().toString(),
    role,
    assignedBy: role === "owner" ? null : UUID.generate().toString(),
    organizationId: UUID.generate().toString(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// create / reconstitute
// ---------------------------------------------------------------------------

describe("MemberCollection.create", () => {
  it("creates an empty collection when no values are provided", () => {
    const collection = MemberCollection.create();

    expect(collection.all).toHaveLength(0);
  });

  it("creates a collection from member definitions", () => {
    const collection = MemberCollection.create([
      { userId: UUID.generate(), assignedBy: null, role: "owner" },
      { userId: UUID.generate(), assignedBy: UUID.generate(), role: "member" },
    ]);

    expect(collection.all).toHaveLength(2);
  });
});

describe("MemberCollection.reconstitute", () => {
  it("rebuilds a collection from select values", () => {
    const collection = MemberCollection.reconstitute([
      buildMemberSelect("owner"),
      buildMemberSelect("member"),
    ]);

    expect(collection.all).toHaveLength(2);
    expect(collection.owner).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// owner
// ---------------------------------------------------------------------------

describe("MemberCollection.owner", () => {
  it("returns the owner member", () => {
    const collection = MemberCollection.create([
      { userId: UUID.generate(), assignedBy: null, role: "owner" },
      { userId: UUID.generate(), assignedBy: UUID.generate(), role: "member" },
    ]);

    expect(collection.owner!.role.isOwner()).toBe(true);
  });

  it("returns null when there is no owner", () => {
    const collection = MemberCollection.create([
      { userId: UUID.generate(), assignedBy: UUID.generate(), role: "member" },
    ]);

    expect(collection.owner).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getMember / getMemberByUserId
// ---------------------------------------------------------------------------

describe("MemberCollection.getMember", () => {
  it("returns the member when found", () => {
    const collection = MemberCollection.create();
    const member = buildMember();
    collection.addMember(member);

    expect(collection.getMember(member.id)!.id.equals(member.id)).toBe(true);
  });

  it("returns null when the member does not exist", () => {
    const collection = MemberCollection.create();

    expect(collection.getMember(UUID.generate())).toBeNull();
  });
});

describe("MemberCollection.getMemberByUserId", () => {
  it("returns the member when the userId matches", () => {
    const collection = MemberCollection.create();
    const member = buildMember();
    collection.addMember(member);

    expect(collection.getMemberByUserId(member.userId)!.id.equals(member.id)).toBe(
      true,
    );
  });

  it("returns null when no member has the userId", () => {
    const collection = MemberCollection.create();
    collection.addMember(buildMember());

    expect(collection.getMemberByUserId(UUID.generate())).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// addMember
// ---------------------------------------------------------------------------

describe("MemberCollection.addMember", () => {
  it("adds a member to the collection", () => {
    const collection = MemberCollection.create();
    const member = buildMember();

    collection.addMember(member);

    expect(collection.all).toHaveLength(1);
  });

  it("throws MemberAlreadyExistsException when the member id already exists", () => {
    const collection = MemberCollection.create();
    const member = buildMember();
    collection.addMember(member);

    expect(() => collection.addMember(member)).toThrow(MemberAlreadyExistsException);
  });

  it("throws MemberAlreadyExistsException when adding a second owner", () => {
    const collection = MemberCollection.create([
      { userId: UUID.generate(), assignedBy: null, role: "owner" },
    ]);
    const secondOwner = buildMember({ role: "owner" });

    expect(() => collection.addMember(secondOwner)).toThrow(
      MemberAlreadyExistsException,
    );
  });
});

// ---------------------------------------------------------------------------
// removeMember
// ---------------------------------------------------------------------------

describe("MemberCollection.removeMember", () => {
  it("removes an existing member and returns it", () => {
    const collection = MemberCollection.create();
    const member = buildMember();
    collection.addMember(member);

    const removed = collection.removeMember(member.id);

    expect(removed.id.equals(member.id)).toBe(true);
    expect(collection.all).toHaveLength(0);
  });

  it("throws MemberNotFoundException when the member does not exist", () => {
    const collection = MemberCollection.create();

    expect(() => collection.removeMember(UUID.generate())).toThrow(
      MemberNotFoundException,
    );
  });

  it("throws CantRemoveOwnerException when removing the owner", () => {
    const collection = MemberCollection.create([
      { userId: UUID.generate(), assignedBy: null, role: "owner" },
    ]);

    expect(() => collection.removeMember(collection.owner!.id)).toThrow(
      CantRemoveOwnerException,
    );
  });
});

// ---------------------------------------------------------------------------
// values
// ---------------------------------------------------------------------------

describe("MemberCollection.values", () => {
  it("serializes members with the organizationId", () => {
    const collection = MemberCollection.create();
    const member = buildMember();
    collection.addMember(member);
    const organizationId = UUID.generate();

    const values = collection.values(organizationId);

    expect(values).toHaveLength(1);
    expect(values[0]!.organizationId).toBe(organizationId.toString());
    expect(values[0]!.id).toBe(member.id.toString());
  });
});