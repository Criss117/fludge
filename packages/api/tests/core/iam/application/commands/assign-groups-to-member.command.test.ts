import { beforeEach, describe, expect, it } from "bun:test";

import { AssignGroupsToMemberCommand } from "@fludge/api/core/iam/application/commands/assign-groups-to-member.command";
import { Group } from "@fludge/api/core/iam/domain/entities/group.entity";
import { Organization } from "@fludge/api/core/iam/domain/entities/organization.entity";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import { MemberIsOwnerException } from "@fludge/api/core/iam/domain/exceptions/member-is-owner.exception";
import { MemberNotFoundException } from "@fludge/api/core/iam/domain/exceptions/member-not-found.exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";

import { makeAuthContext, makeMember, makeOwner } from "../../factories";
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

describe("AssignGroupsToMemberCommand", () => {
  let groupRepository: InMemoryGroupRepository;
  let memberRepository: InMemoryMemberRepository;
  let command: AssignGroupsToMemberCommand;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
    memberRepository = new InMemoryMemberRepository();
    command = new AssignGroupsToMemberCommand(groupRepository, memberRepository);
  });

  describe("happy path", () => {
    it("assigns multiple groups to a member and persists the relation", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const member = makeMember({ organizationId: org.id });
      const groupOne = setupGroup(org.id, "Equipo Ventas");
      const groupTwo = setupGroup(org.id, "Equipo Soporte");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, member]);
      await groupRepository.save([groupOne, groupTwo]);

      const result = await command.execute(auth, {
        memberId: member.id.toString(),
        groupIds: [groupOne.id.toString(), groupTwo.id.toString()],
      });

      expect(result).toHaveLength(2);

      for (const group of result) {
        const memberIds = group.members.map((gm) => gm.memberId);
        expect(memberIds).toContain(member.id.toString());
      }

      const [storedGroupOne] = await groupRepository.findById(
        org.id.toString(),
        groupOne.id.toString(),
      );
      const [storedGroupTwo] = await groupRepository.findById(
        org.id.toString(),
        groupTwo.id.toString(),
      );

      expect(storedGroupOne!.getGroupMemberByMemberId(member.id)).not.toBeNull();
      expect(storedGroupTwo!.getGroupMemberByMemberId(member.id)).not.toBeNull();
    });
  });

  describe("error cases", () => {
    it("throws GroupNotFoundException when some groups are missing", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const member = makeMember({ organizationId: org.id });
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, member]);
      await groupRepository.save(group);

      const err = await command
        .execute(auth, {
          memberId: member.id.toString(),
          groupIds: [group.id.toString(), UUID.generate().toString()],
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(GroupNotFoundException);
      expect(err.message).toBe("api_errors.iam.groups.not_found");
    });

    it("throws MemberNotFoundException when the member is missing", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const group = setupGroup(org.id, "Equipo Ventas");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save(owner);
      await groupRepository.save(group);

      const err = await command
        .execute(auth, {
          memberId: UUID.generate().toString(),
          groupIds: [group.id.toString()],
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(MemberNotFoundException);
      expect(err.message).toBe("api_errors.iam.members.not_found");
    });

    it("throws MemberIsOwnerException when the target member is an owner", async () => {
      const org = setupOrganization();
      const auth = makeAuthContext({ member: makeOwner({ organizationId: org.id }) });
      const targetOwner = makeOwner({ organizationId: org.id });
      const group = setupGroup(org.id, "Equipo Ventas");

      await memberRepository.save([auth.member, targetOwner]);
      await groupRepository.save(group);

      const err = await command
        .execute(auth, {
          memberId: targetOwner.id.toString(),
          groupIds: [group.id.toString()],
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(MemberIsOwnerException);
      expect(err.message).toBe("api_errors.iam.members.is_owner");
    });
  });
});