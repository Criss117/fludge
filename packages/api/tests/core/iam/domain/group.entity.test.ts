import { describe, expect, it } from "bun:test";

import { Status } from "@fludge/api/core/shared/value-objects/status";
import type {
  GroupMemberSelect,
  GroupSelect,
} from "@fludge/db/schema/iam.schema";
import { Permissions } from "@fludge/utils/permissions/index";
import { Slug } from "@fludge/utils/slugify";
import { UUID } from "@fludge/utils/uuid";

import { GroupMember } from "../../../../src/core/iam/domain/entities/group-member.entity";
import { Group } from "../../../../src/core/iam/domain/entities/group.entity";
import { GroupMemberAlreadyExistsException } from "../../../../src/core/iam/domain/exceptions/group-member-already-exists.exception";

const ORGANIZATION_ID = UUID.fromString(
  "0192d840-7c3f-73b2-8f71-2c1b6a9e5d10",
);
const CREATED_BY = UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d11");
const MEMBER_ID = UUID.fromString("0192d840-7c3f-73b2-8f71-2c1b6a9e5d12");

const CREATE_INPUT = {
  name: "Sales Team",
  description: "Handles all sales",
  permissions: Permissions.fromRecord({
    categories: ["read", "update"],
  }),
  createdBy: CREATED_BY,
  organizationId: ORGANIZATION_ID,
};

const GROUP_MEMBER: GroupMemberSelect = {
  groupId: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d20",
  memberId: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d21",
  organizationId: ORGANIZATION_ID.toString(),
  createdBy: CREATED_BY.toString(),
  createdAt: new Date("2025-01-15T10:30:00.000Z"),
};

const PERSISTED: GroupSelect & { members: GroupMemberSelect[] } = {
  id: "0192d840-7c3f-73b2-8f71-2c1b6a9e5d30",
  name: "Engineering",
  slug: "engineering",
  description: "Core engineering team",
  permissions: ["categories:read", "products:read"],
  organizationId: ORGANIZATION_ID.toString(),
  createdBy: CREATED_BY.toString(),
  status: "active",
  createdAt: new Date("2025-01-15T10:30:00.000Z"),
  updatedAt: new Date("2025-02-20T08:00:00.000Z"),
  members: [GROUP_MEMBER],
};

describe("Group", () => {
  describe("create", () => {
    it("creates a group preserving every provided value", () => {
      const values = Group.create(CREATE_INPUT).values;

      expect(values.id).toBeTypeOf("string");
      expect(values.name).toBe(CREATE_INPUT.name);
      expect(values.organizationId).toBe(ORGANIZATION_ID.toString());
      expect(values.createdBy).toBe(CREATED_BY.toString());
      expect(values.description).toBe(CREATE_INPUT.description);
      expect(values.status).toBe("active");
    });

    it("generates a valid UUID v7 id", () => {
      const id = Group.create(CREATE_INPUT).id.toString();

      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("generates a unique id for each group", () => {
      const first = Group.create(CREATE_INPUT).id.toString();
      const second = Group.create(CREATE_INPUT).id.toString();

      expect(first).not.toBe(second);
    });

    it("generates a slug from the name", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.values.slug).toBe(new Slug(CREATE_INPUT.name).toString());
      expect(group.values.slug).toBe("sales-team");
    });

    it("defaults the description to an empty string when not provided", () => {
      const group = Group.create({
        name: "Ops",
        permissions: Permissions.fromRecord({ groups: ["read"] }),
        createdBy: CREATED_BY,
        organizationId: ORGANIZATION_ID,
      });

      expect(group.values.description).toBe("");
    });

    it("starts with an empty members map", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.members).toBeInstanceOf(Map);
      expect(group.members.size).toBe(0);
      expect(group.values.members).toEqual([]);
    });

    it("keeps the provided permissions", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.permissions).toBeInstanceOf(Permissions);
      expect(group.permissions.values).toEqual([
        "categories:read",
        "categories:update",
      ]);
    });

    it("sets the status to active", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.status).toBeInstanceOf(Status);
      expect(group.status.value).toBe("active");
      expect(group.status.isActive()).toBe(true);
    });

    it("sets createdAt and updatedAt to the same instant", () => {
      const values = Group.create(CREATE_INPUT).values;

      expect(values.createdAt.getTime()).toBe(values.updatedAt.getTime());
    });
  });

  describe("reconstitute", () => {
    it("reconstructs a group preserving every persisted field", () => {
      const group = Group.reconstitute(PERSISTED);
      const values = group.values;

      expect(values.id).toBe(PERSISTED.id);
      expect(values.name).toBe(PERSISTED.name);
      expect(values.slug).toBe(PERSISTED.slug);
      expect(values.description).toBe(PERSISTED.description);
      expect(values.organizationId).toBe(PERSISTED.organizationId);
      expect(values.createdBy).toBe(PERSISTED.createdBy);
      expect(values.status).toBe(PERSISTED.status);
      expect(values.createdAt).toEqual(PERSISTED.createdAt);
      expect(values.updatedAt).toEqual(PERSISTED.updatedAt);
      expect(values.permissions).toEqual(PERSISTED.permissions);
    });

    it("reconstructs the members Map from the members array", () => {
      const group = Group.reconstitute(PERSISTED);

      expect(group.members).toBeInstanceOf(Map);
      expect(group.members.size).toBe(PERSISTED.members.length);

      const member = group.members.get(
        `${GROUP_MEMBER.groupId}-${GROUP_MEMBER.memberId}`,
      );
      expect(member).toBeDefined();
      expect(member).toBeInstanceOf(GroupMember);
      expect(group.values.members).toEqual(PERSISTED.members);
    });

    it("reconstitutes an empty members array into an empty Map", () => {
      const group = Group.reconstitute({ ...PERSISTED, members: [] });

      expect(group.members.size).toBe(0);
      expect(group.values.members).toEqual([]);
    });

    it("reconstitutes an inactive status", () => {
      const group = Group.reconstitute({ ...PERSISTED, status: "inactive" });

      expect(group.status).toBeInstanceOf(Status);
      expect(group.status.value).toBe("inactive");
    });

    it("returns the same data passed in through the values getter", () => {
      expect(Group.reconstitute(PERSISTED).values).toEqual(PERSISTED);
    });
  });

  describe("update", () => {
    it("updates the name and regenerates the slug", () => {
      const group = Group.create(CREATE_INPUT);

      group.update({ name: "Support Team" });

      expect(group.values.name).toBe("Support Team");
      expect(group.values.slug).toBe("support-team");
      expect(group.values.slug).toBe(new Slug("Support Team").toString());
    });

    it("updates the description when provided", () => {
      const group = Group.create(CREATE_INPUT);

      group.update({ description: "New description" });

      expect(group.values.description).toBe("New description");
    });

    it("updates the permissions when provided", () => {
      const group = Group.create(CREATE_INPUT);
      const newPermissions = Permissions.fromList(["products:read"]);

      group.update({ permissions: newPermissions });

      expect(group.permissions).toBe(newPermissions);
      expect(group.permissions.values).toEqual(["products:read"]);
    });

    it("updates the status when provided", () => {
      const group = Group.create(CREATE_INPUT);

      group.update({ status: "inactive" });

      expect(group.status).toBeInstanceOf(Status);
      expect(group.status.value).toBe("inactive");
      expect(group.status.isInactive()).toBe(true);
    });

    it("updates multiple fields at once", () => {
      const group = Group.create(CREATE_INPUT);

      group.update({
        name: "Support Team",
        description: "Assists customers",
        status: "inactive",
      });

      const values = group.values;
      expect(values.name).toBe("Support Team");
      expect(values.slug).toBe("support-team");
      expect(values.description).toBe("Assists customers");
      expect(values.status).toBe("inactive");
    });

    it("calls touch so updatedAt changes", () => {
      const group = Group.create(CREATE_INPUT);
      const before = group.values.updatedAt.getTime();

      group.update({ name: "Support Team" });

      expect(group.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("does not change fields not provided", () => {
      const group = Group.create(CREATE_INPUT);
      const before = group.values;

      group.update({ description: "New description" });

      expect(group.values.id).toBe(before.id);
      expect(group.values.name).toBe(before.name);
      expect(group.values.slug).toBe(before.slug);
      expect(group.values.permissions).toEqual(before.permissions);
      expect(group.values.status).toBe(before.status);
      expect(group.values.createdBy).toBe(before.createdBy);
      expect(group.values.organizationId).toBe(before.organizationId);
    });

    it("does not change any field when passed an empty object", () => {
      const group = Group.create(CREATE_INPUT);
      const before = group.values;

      group.update({});

      expect(group.values.id).toBe(before.id);
      expect(group.values.name).toBe(before.name);
      expect(group.values.slug).toBe(before.slug);
      expect(group.values.description).toBe(before.description);
      expect(group.values.permissions).toEqual(before.permissions);
      expect(group.values.status).toBe(before.status);
    });
  });

  describe("setInactive / setActive / toggleStatus", () => {
    it("setInactive changes the status and touches updatedAt", () => {
      const group = Group.create(CREATE_INPUT);
      const before = group.values.updatedAt.getTime();

      group.setInactive();

      expect(group.status.value).toBe("inactive");
      expect(group.status.isInactive()).toBe(true);
      expect(group.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("setActive changes an inactive status and touches updatedAt", () => {
      const group = Group.create(CREATE_INPUT);
      group.setInactive();
      const before = group.values.updatedAt.getTime();

      group.setActive();

      expect(group.status.value).toBe("active");
      expect(group.status.isActive()).toBe(true);
      expect(group.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("toggleStatus flips active to inactive and back", () => {
      const group = Group.create(CREATE_INPUT);
      const before = group.values.updatedAt.getTime();

      group.toggleStatus();
      expect(group.status.value).toBe("inactive");

      group.toggleStatus();
      expect(group.status.value).toBe("active");
      expect(group.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe("nameIsTaken", () => {
    it("returns true for the exact current name", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.nameIsTaken(CREATE_INPUT.name)).toBe(true);
    });

    it("returns true for a slug-equivalent name", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.nameIsTaken("sales team")).toBe(true);
      expect(group.nameIsTaken("Sales-Team!")).toBe(true);
    });

    it("returns false for an unrelated name", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.nameIsTaken("Marketing")).toBe(false);
    });
  });

  describe("addGroupMember", () => {
    function createGroupMember(group: Group) {
      return GroupMember.create({
        groupId: group.id.toString(),
        memberId: MEMBER_ID.toString(),
        createdBy: CREATED_BY.toString(),
        organizationId: ORGANIZATION_ID.toString(),
      });
    }

    it("adds the member to the map", () => {
      const group = Group.create(CREATE_INPUT);
      const groupMember = createGroupMember(group);

      group.addGroupMember(groupMember);

      expect(group.members.size).toBe(1);
      expect(group.getGroupMemberByMemberId(MEMBER_ID)).toBe(groupMember);
      expect(group.values.members).toEqual([groupMember.values]);
    });

    it("touches updatedAt when a member is added", () => {
      const group = Group.create(CREATE_INPUT);
      const before = group.values.updatedAt.getTime();

      group.addGroupMember(createGroupMember(group));

      expect(group.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("throws GroupMemberAlreadyExistsException when the member already exists", () => {
      const group = Group.create(CREATE_INPUT);
      const groupMember = createGroupMember(group);

      group.addGroupMember(groupMember);

      expect(() => group.addGroupMember(groupMember)).toThrow(
        GroupMemberAlreadyExistsException,
      );
    });

    it("allows adding a different member with the same entity as a group", () => {
      const group = Group.create(CREATE_INPUT);
      const otherMemberId = UUID.fromString(
        "0192d840-7c3f-73b2-8f71-2c1b6a9e5d13",
      );

      group.addGroupMember(createGroupMember(group));
      group.addGroupMember(
        GroupMember.create({
          groupId: group.id.toString(),
          memberId: otherMemberId.toString(),
          createdBy: CREATED_BY.toString(),
          organizationId: ORGANIZATION_ID.toString(),
        }),
      );

      expect(group.members.size).toBe(2);
    });
  });

  describe("removeGroupMember", () => {
    function createGroupMember(group: Group, memberId: UUID) {
      return GroupMember.create({
        groupId: group.id.toString(),
        memberId: memberId.toString(),
        createdBy: CREATED_BY.toString(),
        organizationId: ORGANIZATION_ID.toString(),
      });
    }

    it("removes a single member", () => {
      const group = Group.create(CREATE_INPUT);
      const groupMember = createGroupMember(group, MEMBER_ID);
      group.addGroupMember(groupMember);

      group.removeGroupMember(groupMember);

      expect(group.members.size).toBe(0);
      expect(group.getGroupMemberByMemberId(MEMBER_ID)).toBeNull();
    });

    it("removes an array of members", () => {
      const group = Group.create(CREATE_INPUT);
      const otherMemberId = UUID.fromString(
        "0192d840-7c3f-73b2-8f71-2c1b6a9e5d13",
      );
      const first = createGroupMember(group, MEMBER_ID);
      const second = createGroupMember(group, otherMemberId);
      group.addGroupMember(first);
      group.addGroupMember(second);

      group.removeGroupMember([first, second]);

      expect(group.members.size).toBe(0);
    });

    it("only removes the provided members", () => {
      const group = Group.create(CREATE_INPUT);
      const otherMemberId = UUID.fromString(
        "0192d840-7c3f-73b2-8f71-2c1b6a9e5d13",
      );
      const keep = createGroupMember(group, MEMBER_ID);
      const remove = createGroupMember(group, otherMemberId);
      group.addGroupMember(keep);
      group.addGroupMember(remove);

      group.removeGroupMember(remove);

      expect(group.members.size).toBe(1);
      expect(group.getGroupMemberByMemberId(MEMBER_ID)).toBe(keep);
    });

    it("touches updatedAt when members are removed", () => {
      const group = Group.create(CREATE_INPUT);
      const groupMember = createGroupMember(group, MEMBER_ID);
      group.addGroupMember(groupMember);
      const before = group.values.updatedAt.getTime();

      group.removeGroupMember(groupMember);

      expect(group.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  describe("getGroupMemberByMemberId", () => {
    it("returns the member when it exists", () => {
      const group = Group.create(CREATE_INPUT);
      const groupMember = GroupMember.create({
        groupId: group.id.toString(),
        memberId: MEMBER_ID.toString(),
        createdBy: CREATED_BY.toString(),
        organizationId: ORGANIZATION_ID.toString(),
      });
      group.addGroupMember(groupMember);

      expect(group.getGroupMemberByMemberId(MEMBER_ID)).toBe(groupMember);
    });

    it("returns null when the member does not exist", () => {
      const group = Group.create(CREATE_INPUT);

      expect(group.getGroupMemberByMemberId(MEMBER_ID)).toBeNull();
    });
  });

  describe("getters", () => {
    it("returns the id as a UUID instance", () => {
      expect(Group.create(CREATE_INPUT).id).toBeInstanceOf(UUID);
    });

    it("returns the status as a Status instance", () => {
      const status = Group.create(CREATE_INPUT).status;

      expect(status).toBeInstanceOf(Status);
      expect(status.value).toBe("active");
    });

    it("returns the permissions as a Permissions instance", () => {
      const permissions = Group.create(CREATE_INPUT).permissions;

      expect(permissions).toBeInstanceOf(Permissions);
      expect(permissions.values).toEqual(["categories:read", "categories:update"]);
    });

    it("returns the members as a Map", () => {
      expect(Group.create(CREATE_INPUT).members).toBeInstanceOf(Map);
    });
  });
});