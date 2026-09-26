import { describe, expect, it } from "bun:test";

import { Role } from "@fludge/api/core/shared/value-objects/role";
import { Status } from "@fludge/api/core/shared/value-objects/status";
import type { MemberSelect } from "@fludge/db/schema/iam.schema";
import { UUID } from "@fludge/utils/uuid";

import { Member } from "../../../../src/core/iam/domain/entities/member.entity";

const ORGANIZATION_ID = UUID.fromString(
  "0192d840-7c3f-73b2-8f71-2c1b6a9e5d10",
);
const USER_ID = UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d11");
const ASSIGNED_BY = UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d12");

const CREATE_INPUT = {
  userId: USER_ID,
  assignedBy: ASSIGNED_BY,
  role: "member" as const,
  organizationId: ORGANIZATION_ID,
};

const PERSISTED: MemberSelect = {
  id: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d20",
  userId: USER_ID.toString(),
  role: "member",
  assignedBy: ASSIGNED_BY.toString(),
  organizationId: ORGANIZATION_ID.toString(),
  status: "active",
  createdAt: new Date("2025-01-15T10:30:00.000Z"),
  updatedAt: new Date("2025-02-20T08:00:00.000Z"),
};

describe("Member", () => {
  describe("create", () => {
    it("creates a member preserving every provided value", () => {
      const values = Member.create(CREATE_INPUT).values;

      expect(values.userId).toBe(USER_ID.toString());
      expect(values.organizationId).toBe(ORGANIZATION_ID.toString());
      expect(values.assignedBy).toBe(ASSIGNED_BY.toString());
      expect(values.role).toBe("member");
    });

    it("generates a valid UUID v7 id", () => {
      const id = Member.create(CREATE_INPUT).id.toString();

      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("generates a unique id for each member", () => {
      const first = Member.create(CREATE_INPUT).id.toString();
      const second = Member.create(CREATE_INPUT).id.toString();

      expect(first).not.toBe(second);
    });

    it("accepts a null assignedBy", () => {
      const member = Member.create({ ...CREATE_INPUT, assignedBy: null });

      expect(member.values.assignedBy).toBeNull();
    });

    it("creates an owner role from the provided role", () => {
      const member = Member.create({ ...CREATE_INPUT, role: "owner" });

      expect(member.role.value).toBe("owner");
      expect(member.role.isOwner()).toBe(true);
    });

    it("sets the status to active", () => {
      const member = Member.create(CREATE_INPUT);

      expect(member.status).toBeInstanceOf(Status);
      expect(member.status.value).toBe("active");
      expect(member.status.isActive()).toBe(true);
    });

    it("sets createdAt and updatedAt to the same instant", () => {
      const values = Member.create(CREATE_INPUT).values;

      expect(values.createdAt.getTime()).toBe(values.updatedAt.getTime());
    });

    it("returns the expected plain object matching the MemberSelect shape", () => {
      const values = Member.create(CREATE_INPUT).values;

      expect(values).toEqual({
        organizationId: ORGANIZATION_ID.toString(),
        id: values.id,
        userId: USER_ID.toString(),
        createdAt: values.createdAt,
        assignedBy: ASSIGNED_BY.toString(),
        role: "member",
        status: "active",
        updatedAt: values.updatedAt,
      });
    });
  });

  describe("reconstitute", () => {
    it("reconstructs a member preserving every persisted field", () => {
      const values = Member.reconstitute(PERSISTED).values;

      expect(values.id).toBe(PERSISTED.id);
      expect(values.userId).toBe(PERSISTED.userId);
      expect(values.organizationId).toBe(PERSISTED.organizationId);
      expect(values.assignedBy).toBe(PERSISTED.assignedBy);
      expect(values.role).toBe(PERSISTED.role);
      expect(values.status).toBe(PERSISTED.status);
      expect(values.createdAt).toEqual(PERSISTED.createdAt);
      expect(values.updatedAt).toEqual(PERSISTED.updatedAt);
    });

    it("returns the same data passed in through the values getter", () => {
      expect(Member.reconstitute(PERSISTED).values).toEqual(PERSISTED);
    });

    it("reconstitutes a null assignedBy", () => {
      const member = Member.reconstitute({ ...PERSISTED, assignedBy: null });

      expect(member.values.assignedBy).toBeNull();
    });

    it("reconstitutes an inactive status", () => {
      const member = Member.reconstitute({ ...PERSISTED, status: "inactive" });

      expect(member.status).toBeInstanceOf(Status);
      expect(member.status.value).toBe("inactive");
      expect(member.status.isInactive()).toBe(true);
    });

    it("reconstitutes an owner role", () => {
      const member = Member.reconstitute({ ...PERSISTED, role: "owner" });

      expect(member.role.value).toBe("owner");
      expect(member.role.isOwner()).toBe(true);
    });
  });

  describe("setInactive / setActive / toggleStatus", () => {
    it("setInactive changes the status and touches updatedAt", () => {
      const member = Member.create(CREATE_INPUT);
      const before = member.values.updatedAt.getTime();

      member.setInactive();

      expect(member.status.value).toBe("inactive");
      expect(member.status.isInactive()).toBe(true);
      expect(member.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("setActive changes an inactive status and touches updatedAt", () => {
      const member = Member.create(CREATE_INPUT);
      member.setInactive();
      const before = member.values.updatedAt.getTime();

      member.setActive();

      expect(member.status.value).toBe("active");
      expect(member.status.isActive()).toBe(true);
      expect(member.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("toggleStatus flips active to inactive and back", () => {
      const member = Member.create(CREATE_INPUT);
      const before = member.values.updatedAt.getTime();

      member.toggleStatus();
      expect(member.status.value).toBe("inactive");

      member.toggleStatus();
      expect(member.status.value).toBe("active");
      expect(member.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe("touch", () => {
    it("updates updatedAt to a newer instant", () => {
      const member = Member.create(CREATE_INPUT);
      const before = member.values.updatedAt.getTime();

      member.touch();

      expect(member.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("does not change createdAt", () => {
      const member = Member.create(CREATE_INPUT);
      const createdAt = member.values.createdAt;

      member.touch();

      expect(member.values.createdAt).toEqual(createdAt);
    });

    it("does not change any other field", () => {
      const member = Member.create(CREATE_INPUT);
      const before = member.values;

      member.touch();

      expect(member.values.id).toBe(before.id);
      expect(member.values.userId).toBe(before.userId);
      expect(member.values.organizationId).toBe(before.organizationId);
      expect(member.values.assignedBy).toBe(before.assignedBy);
      expect(member.values.role).toBe(before.role);
      expect(member.values.status).toBe(before.status);
    });
  });

  describe("getters", () => {
    it("returns the id as a UUID instance", () => {
      expect(Member.create(CREATE_INPUT).id).toBeInstanceOf(UUID);
    });

    it("returns the userId as a UUID instance", () => {
      expect(Member.create(CREATE_INPUT).userId).toBeInstanceOf(UUID);
    });

    it("returns the role as a Role instance", () => {
      const role = Member.create(CREATE_INPUT).role;

      expect(role).toBeInstanceOf(Role);
      expect(role.value).toBe("member");
      expect(role.isMember()).toBe(true);
    });

    it("returns the status as a Status instance", () => {
      const member = Member.reconstitute({ ...PERSISTED, status: "inactive" });
      const status = member.status;

      expect(status).toBeInstanceOf(Status);
      expect(status.value).toBe("inactive");
      expect(status.isInactive()).toBe(true);
    });
  });

  describe("values", () => {
    it("returns the null assignedBy as null", () => {
      const member = Member.create({ ...CREATE_INPUT, assignedBy: null });

      expect(member.values.assignedBy).toBeNull();
    });

    it("returns the current status and role after mutations", () => {
      const member = Member.create(CREATE_INPUT);
      member.setInactive();

      const values = member.values;
      expect(values.role).toBe("member");
      expect(values.status).toBe("inactive");
    });
  });
});