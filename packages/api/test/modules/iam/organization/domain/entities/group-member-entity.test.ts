import { describe, expect, it } from "bun:test";

import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";
import { UUID } from "@fludge/utils/uuid";
import type { GroupMemberSelect } from "@fludge/db/schema/iam.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildGroupMember() {
  return GroupMember.create({
    groupId: UUID.generate().toString(),
    memberId: UUID.generate().toString(),
    createdBy: UUID.generate().toString(),
  });
}

function buildGroupMemberSelect(): GroupMemberSelect {
  return {
    groupId: UUID.generate().toString(),
    memberId: UUID.generate().toString(),
    organizationId: UUID.generate().toString(),
    createdBy: UUID.generate().toString(),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe("GroupMember.create", () => {
  it("creates a group member from string ids", () => {
    const groupId = UUID.generate().toString();
    const memberId = UUID.generate().toString();
    const createdBy = UUID.generate().toString();

    const gm = GroupMember.create({ groupId, memberId, createdBy });

    expect(gm.groupId.toString()).toBe(groupId);
    expect(gm.memberId.toString()).toBe(memberId);
    expect(gm.values.createdBy).toBe(createdBy);
    expect(gm.values.createdAt).toBeInstanceOf(Date);
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("GroupMember.reconstitute", () => {
  it("rebuilds a group member from select values", () => {
    const values = buildGroupMemberSelect();
    const gm = GroupMember.reconstitute(values);

    expect(gm.groupId.toString()).toBe(values.groupId);
    expect(gm.memberId.toString()).toBe(values.memberId);
    expect(gm.values.createdBy).toBe(values.createdBy);
    expect(gm.values.createdAt).toEqual(values.createdAt);
  });
});

// ---------------------------------------------------------------------------
// equals
// ---------------------------------------------------------------------------

describe("GroupMember.equals", () => {
  it("returns true when group and member ids match", () => {
    const gm = buildGroupMember();

    expect(gm.equals(gm.groupId, gm.memberId)).toBe(true);
  });

  it("returns false when group id differs", () => {
    const gm = buildGroupMember();

    expect(gm.equals(UUID.generate(), gm.memberId)).toBe(false);
  });

  it("returns false when member id differs", () => {
    const gm = buildGroupMember();

    expect(gm.equals(gm.groupId, UUID.generate())).toBe(false);
  });
});