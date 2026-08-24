import { describe, expect, it } from "bun:test";
import { Permissions } from "@fludge/utils/permissions";
import { UUID } from "@fludge/utils/uuid";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { MemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-not-found.exeption";
import { GroupMemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-elready-exists.exception";

const createOrganization = () => {
  const ownerUserId = UUID.generate();
  const groupId = UUID.generate();
  return {
    organization: Organization.create({
      name: "Acme Corporation",
      legalName: "Acme Corp Ltd",
      taxId: "TAX-1",
      address: "Main Street",
      phone: "555-0100",
      groups: [
        {
          name: "Editors",
          description: null,
          permissions: Permissions.create({
            groups: ["read"],
            products: ["read"],
          }),
          createdBy: null,
        },
      ],
      owner: { userId: ownerUserId, assignedBy: null, role: "owner" as const },
    }),
    ownerUserId,
    groupId,
  };
};

describe("Organization", () => {
  it("creates with a UUID, slug, owner, and null optional fields", () => {
    const { organization } = createOrganization();
    expect(organization.id.toString()).toMatch(/^[0-9a-f-]+$/);
    expect(organization.values.slug).toBe("acme-corporation");
    expect(organization.values.logo).toBeNull();
    expect(organization.values.metadata).toBeNull();
    expect(organization.members.owner?.role.isOwner()).toBe(true);
  });
  it("updates the name/slug and partial fields", () => {
    const { organization } = createOrganization();
    organization.update({ name: "New Name" });
    expect(organization.values.name).toBe("New Name");
    expect(organization.values.slug).toBe("new-name");
    organization.update({ phone: "123" });
    expect(organization.values.phone).toBe("123");
    expect(organization.values.address).toBe("Main Street");
  });
  it("adds, queries, and removes group members", () => {
    const { organization } = createOrganization();
    const group = organization.groups.values(organization.id)[0]!;
    const owner = organization.members.owner!;
    const createdBy = owner.id;
    organization.addGroupMember(UUID.fromString(group.id), owner.id, createdBy);
    expect(organization.getGroupsOfMember(owner.id)).toHaveLength(1);
    expect(
      organization.getMembersOfGroup(UUID.fromString(group.id)),
    ).toHaveLength(1);
    expect(organization.values.groupMembers).toHaveLength(1);
    expect(() =>
      organization.addGroupMember(
        UUID.fromString(group.id),
        owner.id,
        createdBy,
      ),
    ).toThrow(GroupMemberAlreadyExistsException);
    organization.removeGroupMember(UUID.fromString(group.id), owner.id);
    expect(organization.values.groupMembers).toEqual([]);
  });
  it("rejects unknown groups and members when assigning", () => {
    const { organization, ownerUserId } = createOrganization();
    const owner = organization.members.owner!;
    expect(() =>
      organization.addGroupMember(UUID.generate(), owner.id, owner.id),
    ).toThrow(GroupNotFoundException);
    const group = organization.groups.values(organization.id)[0]!;
    expect(() =>
      organization.addGroupMember(
        UUID.fromString(group.id),
        UUID.generate(),
        owner.id,
      ),
    ).toThrow(MemberNotFoundException);
    expect(organization.members.getMemberByUserId(ownerUserId)).toBe(owner);
  });
  it("grants owners all permissions and members only group permissions", () => {
    const { organization } = createOrganization();
    const owner = organization.members.owner!;
    expect(
      organization.memberHasPermission(owner.id, { sales: ["delete"] }),
    ).toBe(true);
    const member = Member.create({
      userId: UUID.generate(),
      assignedBy: owner.id,
      role: "member",
    });
    organization.members.addMember(member);
    const group = organization.groups.values(organization.id)[0]!;
    organization.addGroupMember(UUID.fromString(group.id), member.id, owner.id);
    expect(
      organization.memberHasPermission(member.id, { groups: ["read"] }),
    ).toBe(true);
    expect(
      organization.memberHasPermission(member.id, { groups: ["delete"] }),
    ).toBe(false);
    expect(
      organization.memberHasPermission(UUID.generate(), { groups: ["read"] }),
    ).toBe(false);
  });
});
