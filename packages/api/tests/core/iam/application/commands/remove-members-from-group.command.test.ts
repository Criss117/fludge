import { beforeEach, describe, expect, it } from "bun:test";

import { AssignMembersToGroupCommand } from "@fludge/api/core/iam/application/commands/assign-members-to-group.command";
import { RemoveMembersFromGroupCommand } from "@fludge/api/core/iam/application/commands/remove-members-from-group.command";
import { Group } from "@fludge/api/core/iam/domain/entities/group.entity";
import { Organization } from "@fludge/api/core/iam/domain/entities/organization.entity";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import { MemberIsOwnerException } from "@fludge/api/core/iam/domain/exceptions/member-is-owner.exception";
import { MemberNotFoundException } from "@fludge/api/core/iam/domain/exceptions/member-not-found.exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";

import { makeAuthContext, makeMember, makeOwner } from "../../factories";
import { InMemoryGroupMemberRepository } from "../../infrastructure/in-memory-group-member.repository";
import { InMemoryGroupRepository } from "../../infrastructure/in-memory-group.repository";
import { InMemoryMemberRepository } from "../../infrastructure/in-memory-member.repository";

function setupOrganization() {
  return Organization.create({
    name: "Acme Corp",
    legalName: "Acme Corporation S.A.",
    taxId: "30-71234567-8",
    address: "Av. Siempre Viva 742",
    phone: "5491155551234",
  });
}

function setupGroup(organizationId: UUID, name: string) {
  return Group.create({
    name,
    description: "Equipo de ventas de la region norte",
    permissions: Permissions.fromList(["groups:read"]),
    createdBy: UUID.generate(),
    organizationId,
  });
}

describe("RemoveMembersFromGroupCommand", () => {
  let groupRepository: InMemoryGroupRepository;
  let memberRepository: InMemoryMemberRepository;
  let groupMemberRepository: InMemoryGroupMemberRepository;
  let command: RemoveMembersFromGroupCommand;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
    memberRepository = new InMemoryMemberRepository();
    groupMemberRepository = new InMemoryGroupMemberRepository();
    command = new RemoveMembersFromGroupCommand(
      groupRepository,
      memberRepository,
      groupMemberRepository,
    );
  });

  describe("happy path", () => {
    it("removes multiple members from the group", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const memberOne = makeMember({ organizationId: org.id });
      const memberTwo = makeMember({ organizationId: org.id });
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, memberOne, memberTwo]);
      await groupRepository.save(group);

      // Pre-assign both members to the group through the assign command.
      const assign = new AssignMembersToGroupCommand(
        groupRepository,
        memberRepository,
      );
      await assign.execute(auth, {
        groupId: group.id.toString(),
        memberIds: [memberOne.id.toString(), memberTwo.id.toString()],
      });

      const result = await command.execute(auth, {
        groupId: group.id.toString(),
        memberIds: [memberOne.id.toString(), memberTwo.id.toString()],
      });

      expect(result.members).toHaveLength(0);

      const [stored] = await groupRepository.findById(
        org.id.toString(),
        group.id.toString(),
      );

      expect(stored!.getGroupMemberByMemberId(memberOne.id)).toBeNull();
      expect(stored!.getGroupMemberByMemberId(memberTwo.id)).toBeNull();
    });

    it("leaves memberships of non-requested members untouched", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const memberOne = makeMember({ organizationId: org.id });
      const memberTwo = makeMember({ organizationId: org.id });
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, memberOne, memberTwo]);
      await groupRepository.save(group);

      const assign = new AssignMembersToGroupCommand(
        groupRepository,
        memberRepository,
      );
      await assign.execute(auth, {
        groupId: group.id.toString(),
        memberIds: [memberOne.id.toString(), memberTwo.id.toString()],
      });

      const result = await command.execute(auth, {
        groupId: group.id.toString(),
        memberIds: [memberOne.id.toString()],
      });

      expect(result.members).toHaveLength(1);

      const [stored] = await groupRepository.findById(
        org.id.toString(),
        group.id.toString(),
      );

      expect(stored!.getGroupMemberByMemberId(memberOne.id)).toBeNull();
      expect(stored!.getGroupMemberByMemberId(memberTwo.id)).not.toBeNull();
    });
  });

  describe("error cases", () => {
    it("throws GroupNotFoundException when the group is missing", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const member = makeMember({ organizationId: org.id });
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, member]);

      const err = await command
        .execute(auth, {
          groupId: UUID.generate().toString(),
          memberIds: [member.id.toString()],
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(GroupNotFoundException);
      expect(err.message).toBe("api_errors.iam.groups.not_found");
    });

    it("throws MemberNotFoundException when some members are missing", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const member = makeMember({ organizationId: org.id });
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, member]);
      await groupRepository.save(group);

      const err = await command
        .execute(auth, {
          groupId: group.id.toString(),
          memberIds: [member.id.toString(), UUID.generate().toString()],
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(MemberNotFoundException);
      expect(err.message).toBe("api_errors.iam.members.not_found");
    });

    it("throws MemberIsOwnerException when any member is an owner", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const member = makeMember({ organizationId: org.id });
      const targetOwner = makeOwner({ organizationId: org.id });
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, member, targetOwner]);
      await groupRepository.save(group);

      const err = await command
        .execute(auth, {
          groupId: group.id.toString(),
          memberIds: [member.id.toString(), targetOwner.id.toString()],
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(MemberIsOwnerException);
      expect(err.message).toBe("api_errors.iam.members.is_owner");
    });
  });
});