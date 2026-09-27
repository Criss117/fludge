import { beforeEach, describe, expect, it } from "bun:test";

import { AddMemberCommand } from "@fludge/api/core/iam/application/commands/add-member.command";
import { MemberAlreadyExistsException } from "@fludge/api/core/iam/domain/exceptions/member-already-exists.exception";
import { UUID } from "@fludge/utils/uuid";

import { makeAuthContext, makeMember, makeOwner } from "../../factories";
import { InMemoryMemberRepository } from "../../infrastructure/in-memory-member.repository";

describe("AddMemberCommand", () => {
  let memberRepository: InMemoryMemberRepository;
  let command: AddMemberCommand;

  beforeEach(() => {
    memberRepository = new InMemoryMemberRepository();
    command = new AddMemberCommand(memberRepository);
  });

  describe("happy path", () => {
    it("adds a member to the auth organization", async () => {
      const owner = makeOwner();
      const auth = makeAuthContext({ member: owner });
      const userId = UUID.generate();

      const result = await command.execute(auth, {
        userId: userId.toString(),
      });

      const [stored] = await memberRepository.findById(
        auth.organizationId.toString(),
        result.id,
      );

      expect(stored).not.toBeNull();
      expect(stored!.values).toMatchObject({
        id: result.id,
        userId: userId.toString(),
        organizationId: auth.organizationId.toString(),
        role: "member",
        assignedBy: owner.id.toString(),
        status: "active",
      });
    });

    it("returns the created member values", async () => {
      const owner = makeOwner();
      const auth = makeAuthContext({ member: owner });
      const userId = UUID.generate();

      const result = await command.execute(auth, {
        userId: userId.toString(),
      });

      expect(result).toMatchObject({
        userId: userId.toString(),
        organizationId: auth.organizationId.toString(),
        role: "member",
        assignedBy: owner.id.toString(),
        status: "active",
      });
    });
  });

  describe("already exists", () => {
    it("throws MemberAlreadyExistsException when the user is already a member", async () => {
      const owner = makeOwner();
      const userId = UUID.generate();
      const auth = makeAuthContext({ member: owner });

      await memberRepository.save(
        makeMember({ organizationId: auth.organizationId, userId }),
      );

      const err = await command
        .execute(auth, { userId: userId.toString() })
        .catch((e) => e);

      expect(err).toBeInstanceOf(MemberAlreadyExistsException);
      expect(err.message).toBe("api_errors.iam.members.already_exists");
      expect(memberRepository.size).toBe(1);
    });

    it("allows the same user in a different organization", async () => {
      const owner = makeOwner();
      const auth = makeAuthContext({ member: owner });
      const userId = UUID.generate();

      // Same user already belongs to another organization.
      await memberRepository.save(makeMember({ userId }));

      const result = await command.execute(auth, {
        userId: userId.toString(),
      });

      expect(result.userId).toBe(userId.toString());
      expect(result.organizationId).toBe(auth.organizationId.toString());
    });
  });
});