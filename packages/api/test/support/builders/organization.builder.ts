import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import type { Permission } from "@fludge/utils/permissions/data";

export type BuiltOrganization = {
  org: Organization;
  ownerUserId: string;
  ownerMemberId: string;
};

export function buildOrganization(options?: {
  withGroups?: boolean;
  memberCount?: number;
}): BuiltOrganization {
  const ownerUserId = UUID.generate().toString();

  const org = Organization.create({
    name: "Fludge Corp",
    legalName: "Fludge Corp S.A.",
    taxId: "900-123-456",
    address: "Calle 123",
    phone: "+57 300 123 4567",
    owner: {
      userId: UUID.fromString(ownerUserId),
      role: "owner",
      assignedBy: null,
    },
    groups: options?.withGroups
      ? [
          {
            name: "Administradores",
            description: "Grupo de administradores",
            permissions: Permissions.fromRecord({
              organizations: ["update"],
            }),
          },
        ]
      : undefined,
  });

  const ownerMemberId = org.members.owner!.id.toString();

  if (options?.memberCount) {
    for (let i = 0; i < options.memberCount; i++) {
      const member = Member.create({
        userId: UUID.generate(),
        role: "member",
        assignedBy: org.members.owner!.id,
      });

      org.members.addMember(member);
    }
  }

  return { org, ownerUserId, ownerMemberId };
}

export function addGroupToOrganization(
  org: Organization,
  options?: { name?: string; permissions?: Permission[] },
) {
  const group = Group.create({
    name: options?.name ?? "Ventas",
    description: "Equipo de ventas",
    permissions: Permissions.fromList(
      options?.permissions ?? ["products:create"],
    ),
    createdBy: org.members.owner!.id,
  });

  org.groups.addGroup(group);

  return group;
}

export function addMemberToOrganization(org: Organization) {
  const member = Member.create({
    userId: UUID.generate(),
    role: "member",
    assignedBy: org.members.owner!.id,
  });

  org.members.addMember(member);

  return member;
}