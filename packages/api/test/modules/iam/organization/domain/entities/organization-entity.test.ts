import { describe, expect, it } from "bun:test";

import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { MemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-not-found.exeption";
import { MemberIsOwnerException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-is-owner.exception";
import { GroupMemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-elready-exists.exception";
import { GroupMemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-not-found.exception";
import { UUID } from "@fludge/utils/uuid";
import { Permissions } from "@fludge/utils/permissions/index";
import { PERMISSIONS } from "@fludge/utils/permissions/data";
import type {
  GroupMemberSelect,
  GroupSelect,
  MemberSelect,
  OrganizationSelect,
} from "@fludge/db/schema/iam.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOwnerUserId() {
  return UUID.generate();
}

function buildOrganization(options?: { withGroups?: boolean }) {
  const ownerUserId = makeOwnerUserId();

  const org = Organization.create({
    name: "Fludge Corp",
    legalName: "Fludge Corp S.A.",
    taxId: "900-123-456",
    address: "Calle 123",
    phone: "+57 300 123 4567",
    logo: "https://cdn.example.com/logo.png",
    metadata: { tier: "enterprise" },
    owner: {
      userId: ownerUserId,
      role: "owner",
      assignedBy: null,
    },
    groups: options?.withGroups
      ? [
          {
            name: "Administradores",
            description: "Grupo de administradores",
            permissions: Permissions.fromRecord(PERMISSIONS),
          },
        ]
      : undefined,
  });

  return { org, ownerUserId };
}

function buildOrganizationSelect(): OrganizationSelect & {
  members: MemberSelect[];
  groups: GroupSelect[];
  groupMembers: GroupMemberSelect[];
} {
  const ownerId = UUID.generate().toString();
  const memberId = UUID.generate().toString();
  const groupId = UUID.generate().toString();
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  const updatedAt = new Date("2026-01-02T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    name: "Fludge Corp",
    slug: "fludge-corp",
    logo: null,
    metadata: null,
    legalName: "Fludge Corp S.A.",
    taxId: "900-123-456",
    address: "Calle 123",
    phone: "+57 300 123 4567",
    status: "active",
    createdAt,
    updatedAt,
    members: [
      {
        id: ownerId,
        userId: UUID.generate().toString(),
        role: "owner",
        assignedBy: null,
        organizationId: UUID.generate().toString(),
        status: "active",
        createdAt,
        updatedAt,
      },
      {
        id: memberId,
        userId: UUID.generate().toString(),
        role: "member",
        assignedBy: ownerId,
        organizationId: UUID.generate().toString(),
        status: "active",
        createdAt,
        updatedAt,
      },
    ],
    groups: [
      {
        id: groupId,
        name: "Ventas",
        slug: "ventas",
        description: "Equipo de ventas",
        permissions: ["products:create", "products:read"],
        organizationId: UUID.generate().toString(),
        createdBy: ownerId,
        status: "active",
        createdAt,
        updatedAt,
      },
    ],
    groupMembers: [
      {
        groupId,
        memberId,
        organizationId: UUID.generate().toString(),
        createdBy: ownerId,
        createdAt,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe("Organization.create", () => {
  it("creates an organization with active status and nullish optional values", () => {
    const { org } = buildOrganization();

    expect(org.values.name).toBe("Fludge Corp");
    expect(org.values.slug).toBe("fludge-corp");
    expect(org.values.logo).toBe("https://cdn.example.com/logo.png");
    expect(org.values.metadata).toEqual({ tier: "enterprise" });
    expect(org.values.legalName).toBe("Fludge Corp S.A.");
    expect(org.values.taxId).toBe("900-123-456");
    expect(org.values.address).toBe("Calle 123");
    expect(org.values.phone).toBe("+57 300 123 4567");
    expect(org.values.status).toBe("active");
    expect(org.values.id).toBeTruthy();
    expect(org.values.createdAt).toBeInstanceOf(Date);
    expect(org.values.updatedAt).toBeInstanceOf(Date);
  });

  it("creates the owner member", () => {
    const { org, ownerUserId } = buildOrganization();

    const owner = org.members.owner;

    expect(owner).not.toBeNull();
    expect(owner!.role.isOwner()).toBe(true);
    expect(owner!.userId.equals(ownerUserId)).toBe(true);
  });

  it("creates an empty group collection when no groups are provided", () => {
    const { org } = buildOrganization();

    expect(org.groups.all).toHaveLength(0);
    expect(org.values.groups).toHaveLength(0);
  });

  it("creates groups with the owner as createdBy when groups are provided", () => {
    const { org } = buildOrganization({ withGroups: true });

    const groups = org.groups.all;

    expect(groups).toHaveLength(1);
    expect(groups[0]!.values.name).toBe("Administradores");
    expect(groups[0]!.values.createdBy).toBe(org.members.owner!.id.toString());
  });

  it("defaults logo and metadata to null when not provided", () => {
    const org = Organization.create({
      name: "Minimal",
      legalName: "Minimal",
      taxId: "1",
      address: "x",
      phone: "1",
      owner: { userId: UUID.generate(), role: "owner", assignedBy: null },
    });

    expect(org.values.logo).toBeNull();
    expect(org.values.metadata).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("Organization.reconstitute", () => {
  it("rebuilds an organization from select values", () => {
    const values = buildOrganizationSelect();
    const org = Organization.reconstitute(values);

    expect(org.values.id).toBe(values.id);
    expect(org.values.name).toBe(values.name);
    expect(org.values.slug).toBe(values.slug);
    expect(org.values.status).toBe(values.status);
    expect(org.values.createdAt).toEqual(values.createdAt);
    expect(org.values.updatedAt).toEqual(values.updatedAt);
  });

  it("rebuilds members, groups and group members", () => {
    const values = buildOrganizationSelect();
    const org = Organization.reconstitute(values);

    expect(org.members.all).toHaveLength(2);
    expect(org.groups.all).toHaveLength(1);
    expect(org.groupMembers).toHaveLength(1);

    const gm = org.groupMembers[0]!;
    expect(gm.groupId.equals(UUID.fromString(values.groupMembers[0]!.groupId))).toBe(true);
    expect(gm.memberId.equals(UUID.fromString(values.groupMembers[0]!.memberId))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// generateGroupMemberKey
// ---------------------------------------------------------------------------

describe("Organization.generateGroupMemberKey", () => {
  it("builds a composite key from group and member ids", () => {
    const groupId = UUID.generate();
    const memberId = UUID.generate();

    const key = Organization.generateGroupMemberKeyFromIds(groupId, memberId);

    expect(key).toBe(`${groupId.toString()}-${memberId.toString()}`);
  });

  it("uses the composite key for a GroupMember entity", () => {
    const gm = GroupMember.create({
      groupId: UUID.generate().toString(),
      memberId: UUID.generate().toString(),
      createdBy: UUID.generate().toString(),
    });

    expect(Organization.generateGroupMemberKey(gm)).toBe(
      `${gm.groupId.toString()}-${gm.memberId.toString()}`,
    );
  });
});

// ---------------------------------------------------------------------------
// touch / update
// ---------------------------------------------------------------------------

describe("Organization.touch", () => {
  it("updates the updatedAt timestamp", () => {
    const { org } = buildOrganization();
    const before = org.values.updatedAt.getTime();

    org.touch();

    expect(org.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("Organization.update", () => {
  it("updates the name and regenerates the slug", () => {
    const { org } = buildOrganization();

    org.update({ name: "Fludge Internacional" });

    expect(org.values.name).toBe("Fludge Internacional");
    expect(org.values.slug).toBe("fludge-internacional");
  });

  it("updates contact and legal fields", () => {
    const { org } = buildOrganization();

    org.update({
      legalName: "Fludge Holding",
      address: "Av. Principal 999",
      phone: "+57 311 000 0000",
      logo: "https://cdn.example.com/new-logo.png",
      metadata: { tier: "premium" },
    });

    expect(org.values.legalName).toBe("Fludge Holding");
    expect(org.values.address).toBe("Av. Principal 999");
    expect(org.values.phone).toBe("+57 311 000 0000");
    expect(org.values.logo).toBe("https://cdn.example.com/new-logo.png");
    expect(org.values.metadata).toEqual({ tier: "premium" });
  });

  it("touches the updatedAt timestamp", () => {
    const { org } = buildOrganization();
    const before = org.values.updatedAt.getTime();

    org.update({ phone: "+57 999 999 9999" });

    expect(org.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ---------------------------------------------------------------------------
// addGroupMember / removeGroupMember
// ---------------------------------------------------------------------------

describe("Organization.addGroupMember", () => {
  it("adds a member to a group", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    const gm = GroupMember.create({
      groupId: group.id.toString(),
      memberId: member.id.toString(),
      createdBy: org.members.owner!.id.toString(),
    });

    org.addGroupMember(gm);

    expect(org.groupMembers).toHaveLength(1);
    expect(org.groupMembers[0]!.equals(group.id, member.id)).toBe(true);
  });

  it("throws GroupNotFoundException when the group does not exist", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const gm = GroupMember.create({
      groupId: UUID.generate().toString(),
      memberId: member.id.toString(),
      createdBy: org.members.owner!.id.toString(),
    });

    expect(() => org.addGroupMember(gm)).toThrow(GroupNotFoundException);
  });

  it("throws MemberNotFoundException when the member does not exist", () => {
    const { org } = buildOrganization();

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    const gm = GroupMember.create({
      groupId: group.id.toString(),
      memberId: UUID.generate().toString(),
      createdBy: org.members.owner!.id.toString(),
    });

    expect(() => org.addGroupMember(gm)).toThrow(MemberNotFoundException);
  });

  it("throws MemberIsOwnerException when the member is the owner", () => {
    const { org } = buildOrganization();

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    const gm = GroupMember.create({
      groupId: group.id.toString(),
      memberId: org.members.owner!.id.toString(),
      createdBy: org.members.owner!.id.toString(),
    });

    expect(() => org.addGroupMember(gm)).toThrow(MemberIsOwnerException);
  });

  it("throws GroupMemberAlreadyExistsException when the relation already exists", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    const gm = GroupMember.create({
      groupId: group.id.toString(),
      memberId: member.id.toString(),
      createdBy: org.members.owner!.id.toString(),
    });

    org.addGroupMember(gm);

    expect(() => org.addGroupMember(gm)).toThrow(GroupMemberAlreadyExistsException);
  });
});

describe("Organization.removeGroupMember", () => {
  it("removes an existing member from a group and returns the relation", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    const removed = org.removeGroupMember(group.id, member.id);

    expect(removed.equals(group.id, member.id)).toBe(true);
    expect(org.groupMembers).toHaveLength(0);
  });

  it("throws GroupNotFoundException when the group does not exist", () => {
    const { org } = buildOrganization();

    expect(() =>
      org.removeGroupMember(UUID.generate(), org.members.owner!.id),
    ).toThrow(GroupNotFoundException);
  });

  it("throws MemberNotFoundException when the member does not exist", () => {
    const { org } = buildOrganization();

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    expect(() =>
      org.removeGroupMember(group.id, UUID.generate()),
    ).toThrow(MemberNotFoundException);
  });

  it("throws MemberIsOwnerException when the member is the owner", () => {
    const { org } = buildOrganization();

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    expect(() =>
      org.removeGroupMember(group.id, org.members.owner!.id),
    ).toThrow(MemberIsOwnerException);
  });

  it("throws GroupMemberNotFoundException when the relation does not exist", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    expect(() =>
      org.removeGroupMember(group.id, member.id),
    ).toThrow(GroupMemberNotFoundException);
  });
});

// ---------------------------------------------------------------------------
// deleteGroup
// ---------------------------------------------------------------------------

describe("Organization.deleteGroup", () => {
  it("removes the group and its group members", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    const result = org.deleteGroup(group.id);

    expect(result.group.id.equals(group.id)).toBe(true);
    expect(result.groupMembers).toHaveLength(1);
    expect(org.groups.getGroup(group.id)).toBeNull();
    expect(org.groupMembers).toHaveLength(0);
  });

  it("throws GroupNotFoundException when the group does not exist", () => {
    const { org } = buildOrganization();

    expect(() => org.deleteGroup(UUID.generate())).toThrow(GroupNotFoundException);
  });
});

// ---------------------------------------------------------------------------
// getGroupsOfMember / getMembersOfGroup
// ---------------------------------------------------------------------------

describe("Organization.getGroupsOfMember", () => {
  function orgWithMemberAndGroups() {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const activeGroup = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(activeGroup);

    const inactiveGroup = Group.create({
      name: "Inactivos",
      permissions: Permissions.fromList(["products:read"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(inactiveGroup);
    org.groups.disableGroup(inactiveGroup.id);

    for (const group of [activeGroup, inactiveGroup]) {
      org.addGroupMember(
        GroupMember.create({
          groupId: group.id.toString(),
          memberId: member.id.toString(),
          createdBy: org.members.owner!.id.toString(),
        }),
      );
    }

    return { org, member, activeGroup, inactiveGroup };
  }

  it("returns all groups of a member", () => {
    const { org, member, activeGroup, inactiveGroup } =
      orgWithMemberAndGroups();

    const groups = org.getGroupsOfMember(member.id);

    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.id.toString())).toEqual(
      expect.arrayContaining([activeGroup.id.toString(), inactiveGroup.id.toString()]),
    );
  });

  it("returns only active groups when onlyActive is set", () => {
    const { org, member, activeGroup } = orgWithMemberAndGroups();

    const groups = org.getGroupsOfMember(member.id, { onlyActive: true });

    expect(groups).toHaveLength(1);
    expect(groups[0]!.id.toString()).toBe(activeGroup.id.toString());
  });

  it("returns an empty array for a member with no groups", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    expect(org.getGroupsOfMember(member.id)).toHaveLength(0);
  });
});

describe("Organization.getMembersOfGroup", () => {
  it("returns the members assigned to a group", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    const members = org.getMembersOfGroup(group.id);

    expect(members).toHaveLength(1);
    expect(members[0]!.id.equals(member.id)).toBe(true);
  });

  it("returns an empty array when the group has no members", () => {
    const { org } = buildOrganization();

    const group = Group.create({
      name: "Ventas",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    expect(org.getMembersOfGroup(group.id)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// memberHasPermission
// ---------------------------------------------------------------------------

describe("Organization.memberHasPermission", () => {
  it("returns false when the member does not exist", () => {
    const { org } = buildOrganization();

    expect(
      org.memberHasPermission(UUID.generate(), { products: ["create"] }),
    ).toBe(false);
  });

  it("returns true for the owner regardless of permissions", () => {
    const { org } = buildOrganization();

    expect(
      org.memberHasPermission(org.members.owner!.id, { products: ["delete"] }),
    ).toBe(true);
  });

  it("returns true when the member's groups grant all required permissions", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Catalog",
      permissions: Permissions.fromList(["products:create", "products:update"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    expect(
      org.memberHasPermission(member.id, {
        products: ["create", "update"],
      }),
    ).toBe(true);
  });

  it("returns false when the member lacks one required permission in all mode", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Catalog",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    expect(
      org.memberHasPermission(member.id, {
        products: ["create", "delete"],
      }),
    ).toBe(false);
  });

  it("returns true when any required permission is granted in any mode", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Catalog",
      permissions: Permissions.fromList(["products:create"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    expect(
      org.memberHasPermission(
        member.id,
        { customers: ["create"], products: ["create"] },
        "any",
      ),
    ).toBe(true);

    expect(
      org.memberHasPermission(
        member.id,
        { products: ["delete"], customers: ["create"] },
        "any",
      ),
    ).toBe(false);
  });

  it("ignores inactive groups when checking permissions", () => {
    const { org } = buildOrganization();

    const member = Member.create({
      userId: UUID.generate(),
      role: "member",
      assignedBy: org.members.owner!.id,
    });
    org.members.addMember(member);

    const group = Group.create({
      name: "Catalog",
      permissions: Permissions.fromList(["products:delete"]),
      createdBy: org.members.owner!.id,
    });
    org.groups.addGroup(group);
    org.groups.disableGroup(group.id);

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    expect(
      org.memberHasPermission(member.id, { products: ["delete"] }),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// values
// ---------------------------------------------------------------------------

describe("Organization.values", () => {
  it("serializes nested members, groups and group members", () => {
    const { org } = buildOrganization({ withGroups: true });

    const values = org.values;

    expect(values.members).toHaveLength(1);
    expect(values.groups).toHaveLength(1);
    expect(values.groupMembers).toHaveLength(0);

    expect(values.members[0]!.organizationId).toBe(values.id);
    expect(values.groups[0]!.organizationId).toBe(values.id);
  });
});