import { beforeEach, describe, expect, it } from "bun:test";

import { AssignGroupsToMemberCommand } from "@fludge/api/core/iam/application/commands/assign-groups-to-member.command";
import { RemoveGroupsFromMemberCommand } from "@fludge/api/core/iam/application/commands/remove-groups-from-member.command";
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

describe("RemoveGroupsFromMemberCommand", () => {
  let groupRepository: InMemoryGroupRepository;
  let memberRepository: InMemoryMemberRepository;
  let groupMemberRepository: InMemoryGroupMemberRepository;
  let command: RemoveGroupsFromMemberCommand;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
    memberRepository = new InMemoryMemberRepository();
    groupMemberRepository = new InMemoryGroupMemberRepository();
    command = new RemoveGroupsFromMemberCommand(
      groupRepository,
      memberRepository,
      groupMemberRepository,
    );
  });

  describe("happy path", () => {
    it("removes the member from all requested groups", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const member = makeMember({ organizationId: org.id });
      const groupOne = setupGroup(org.id, "Equipo Ventas");
      const groupTwo = setupGroup(org.id, "Equipo Soporte");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, member]);
      await groupRepository.save([groupOne, groupTwo]);

      // Pre-assign the member to both groups through the assign command.
      const assign = new AssignGroupsToMemberCommand(
        groupRepository,
        memberRepository,
      );
      await assign.execute(auth, {
        memberId: member.id.toString(),
        groupIds: [groupOne.id.toString(), groupTwo.id.toString()],
      });

      const result = await command.execute(auth, {
        memberId: member.id.toString(),
        groupIds: [groupOne.id.toString(), groupTwo.id.toString()],
      });

      expect(result.map((g) => g.id)).toEqual(
        expect.arrayContaining([groupOne.id.toString(), groupTwo.id.toString()]),
      );

      const [storedOne] = await groupRepository.findById(
        org.id.toString(),
        groupOne.id.toString(),
      );
      const [storedTwo] = await groupRepository.findById(
        org.id.toString(),
        groupTwo.id.toString(),
      );

      expect(storedOne!.getGroupMemberByMemberId(member.id)).toBeNull();
      expect(storedTwo!.getGroupMemberByMemberId(member.id)).toBeNull();
      expect(storedOne!.values.members).toHaveLength(0);
      expect(storedTwo!.values.members).toHaveLength(0);
    });

    it("leaves memberships in non-requested groups untouched", async () => {
      const org = setupOrganization();
      const owner = makeOwner({ organizationId: org.id });
      const member = makeMember({ organizationId: org.id });
      const groupOne = setupGroup(org.id, "Equipo Ventas");
      const groupTwo = setupGroup(org.id, "Equipo Soporte");
      const auth = makeAuthContext({ member: owner, organizationId: org.id });

      await memberRepository.save([owner, member]);
      await groupRepository.save([groupOne, groupTwo]);

      const assign = new AssignGroupsToMemberCommand(
        groupRepository,
        memberRepository,
      );
      await assign.execute(auth, {
        memberId: member.id.toString(),
        groupIds: [groupOne.id.toString(), groupTwo.id.toString()],
      });

      await command.execute(auth, {
        memberId: member.id.toString(),
        groupIds: [groupOne.id.toString()],
      });

      const [storedOne] = await groupRepository.findById(
        org.id.toString(),
        groupOne.id.toString(),
      );
      const [storedTwo] = await groupRepository.findById(
        org.id.toString(),
        groupTwo.id.toString(),
      );

      expect(storedOne!.getGroupMemberByMemberId(member.id)).toBeNull();
      expect(storedTwo!.getGroupMemberByMemberId(member.id)).not.toBeNull();
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