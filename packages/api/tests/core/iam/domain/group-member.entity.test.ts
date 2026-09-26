import { describe, expect, it } from "bun:test";

import type { GroupMemberSelect } from "@fludge/db/schema/iam.schema";
import { UUID } from "@fludge/utils/uuid";

import { GroupMember } from "../../../../src/core/iam/domain/entities/group-member.entity";

const CREATE_INPUT = {
  groupId: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d10",
  memberId: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d11",
  createdBy: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d12",
  organizationId: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d13",
};

const PERSISTED: GroupMemberSelect = {
  groupId: CREATE_INPUT.groupId,
  memberId: CREATE_INPUT.memberId,
  organizationId: CREATE_INPUT.organizationId,
  createdBy: CREATE_INPUT.createdBy,
  createdAt: new Date("2025-01-15T10:30:00.000Z"),
};

describe("GroupMember", () => {
  describe("create", () => {
    it("wraps the string uuids into UUID instances", () => {
      const groupMember = GroupMember.create(CREATE_INPUT);

      expect(groupMember.groupId).toBeInstanceOf(UUID);
      expect(groupMember.memberId).toBeInstanceOf(UUID);
      expect(groupMember.organizationId).toBeInstanceOf(UUID);
    });

    it("preserves the uuid string values", () => {
      const values = GroupMember.create(CREATE_INPUT).values;

      expect(values.groupId).toBe(CREATE_INPUT.groupId);
      expect(values.memberId).toBe(CREATE_INPUT.memberId);
      expect(values.organizationId).toBe(CREATE_INPUT.organizationId);
      expect(values.createdBy).toBe(CREATE_INPUT.createdBy);
    });

    it("sets createdAt to the current instant", () => {
      const before = Date.now();
      const values = GroupMember.create(CREATE_INPUT).values;

      expect(values.createdAt).toBeInstanceOf(Date);
      expect(values.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(values.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("reconstitute", () => {
    it("reconstructs a group member preserving every persisted field", () => {
      const values = GroupMember.reconstitute(PERSISTED).values;

      expect(values.groupId).toBe(PERSISTED.groupId);
      expect(values.memberId).toBe(PERSISTED.memberId);
      expect(values.organizationId).toBe(PERSISTED.organizationId);
      expect(values.createdBy).toBe(PERSISTED.createdBy);
      expect(values.createdAt).toEqual(PERSISTED.createdAt);
    });

    it("returns the same data passed in through the values getter", () => {
      expect(GroupMember.reconstitute(PERSISTED).values).toEqual(PERSISTED);
    });
  });

  describe("getters", () => {
    it("returns groupId, memberId and organizationId as UUID instances", () => {
      const groupMember = GroupMember.reconstitute(PERSISTED);

      expect(groupMember.groupId).toBeInstanceOf(UUID);
      expect(groupMember.memberId).toBeInstanceOf(UUID);
      expect(groupMember.organizationId).toBeInstanceOf(UUID);
    });

    it("exposes the correct uuid strings through the getters", () => {
      const groupMember = GroupMember.reconstitute(PERSISTED);

      expect(groupMember.groupId.toString()).toBe(PERSISTED.groupId);
      expect(groupMember.memberId.toString()).toBe(PERSISTED.memberId);
      expect(groupMember.organizationId.toString()).toBe(
        PERSISTED.organizationId,
      );
    });
  });

  describe("values", () => {
    it("returns the correct shape", () => {
      expect(GroupMember.reconstitute(PERSISTED).values).toEqual(PERSISTED);
    });
  });

  describe("equals", () => {
    it("returns true for a matching groupId and memberId pair", () => {
      const groupMember = GroupMember.create(CREATE_INPUT);

      expect(
        groupMember.equals(
          UUID.fromString(CREATE_INPUT.groupId),
          UUID.fromString(CREATE_INPUT.memberId),
        ),
      ).toBe(true);
    });

    it("returns false for a different groupId", () => {
      const groupMember = GroupMember.create(CREATE_INPUT);

      expect(
        groupMember.equals(
          UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d90"),
          UUID.fromString(CREATE_INPUT.memberId),
        ),
      ).toBe(false);
    });

    it("returns false for a different memberId", () => {
      const groupMember = GroupMember.create(CREATE_INPUT);

      expect(
        groupMember.equals(
          UUID.fromString(CREATE_INPUT.groupId),
          UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d91"),
        ),
      ).toBe(false);
    });

    it("returns false when both ids differ", () => {
      const groupMember = GroupMember.create(CREATE_INPUT);

      expect(
        groupMember.equals(
          UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d90"),
          UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d91"),
        ),
      ).toBe(false);
    });
  });
});