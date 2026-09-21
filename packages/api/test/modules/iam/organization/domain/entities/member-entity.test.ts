import { describe, expect, it } from "bun:test";

import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { UUID } from "@fludge/utils/uuid";
import type { MemberSelect } from "@fludge/db/schema/iam.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMember(options?: { role?: "owner" | "member" }) {
  const userId = UUID.generate();
  const assignedBy = options?.role === "owner" ? null : UUID.generate();

  return Member.create({
    userId,
    assignedBy,
    role: options?.role ?? "member",
  });
}

function buildMemberSelect(): MemberSelect {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    userId: UUID.generate().toString(),
    role: "member",
    assignedBy: UUID.generate().toString(),
    organizationId: UUID.generate().toString(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe("Member.create", () => {
  it("creates a member with active status and generated id", () => {
    const member = buildMember();

    expect(member.values.id).toBeTruthy();
    expect(member.values.status).toBe("active");
    expect(member.values.role).toBe("member");
    expect(member.values.createdAt).toBeInstanceOf(Date);
    expect(member.values.updatedAt).toBeInstanceOf(Date);
  });

  it("creates an owner member when role is owner", () => {
    const member = buildMember({ role: "owner" });

    expect(member.role.isOwner()).toBe(true);
    expect(member.values.assignedBy).toBeNull();
  });

  it("stores the userId", () => {
    const userId = UUID.generate();
    const member = Member.create({ userId, assignedBy: null, role: "owner" });

    expect(member.userId.equals(userId)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("Member.reconstitute", () => {
  it("rebuilds a member from select values", () => {
    const values = buildMemberSelect();
    const member = Member.reconstitute(values);

    expect(member.values.id).toBe(values.id);
    expect(member.values.userId).toBe(values.userId);
    expect(member.values.role).toBe(values.role);
    expect(member.values.status).toBe(values.status);
    expect(member.values.assignedBy).toBe(values.assignedBy);
  });

  it("rebuilds a member with null assignedBy", () => {
    const values = buildMemberSelect();
    values.assignedBy = null;

    const member = Member.reconstitute(values);

    expect(member.values.assignedBy).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// status transitions
// ---------------------------------------------------------------------------

describe("Member status transitions", () => {
  it("setInactive sets the status to inactive", () => {
    const member = buildMember();

    member.setInactive();

    expect(member.status.isInactive()).toBe(true);
  });

  it("setActive sets the status to active", () => {
    const member = buildMember();
    member.setInactive();

    member.setActive();

    expect(member.status.isActive()).toBe(true);
  });

  it("toggleStatus toggles between active and inactive", () => {
    const member = buildMember();

    member.toggleStatus();
    expect(member.status.isInactive()).toBe(true);

    member.toggleStatus();
    expect(member.status.isActive()).toBe(true);
  });

  it("touches the updatedAt timestamp on transitions", () => {
    const member = buildMember();
    const before = member.values.updatedAt.getTime();

    member.toggleStatus();

    expect(member.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ---------------------------------------------------------------------------
// equals
// ---------------------------------------------------------------------------

describe("Member.equals", () => {
  it("returns true when comparing a member with itself", () => {
    const member = buildMember();

    expect(member.equals(member)).toBe(true);
  });

  it("returns false when comparing different members", () => {
    const a = buildMember();
    const b = buildMember();

    expect(a.equals(b)).toBe(false);
  });
});