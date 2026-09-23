import type { z } from "zod";
import type { UserAuthContext } from "@core/iam/domain/entities/user-auth-context.entity";
import { Member } from "@core/iam/domain/entities/member.entity";
import { MemberAlreadyExistsException } from "@core/iam/domain/exceptions/member-already-exists.exception";
import type { MemberRepository } from "@core/iam/domain/repositories/member.repository";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { UUID } from "@fludge/utils/uuid";
import { addMemberValidator } from "@fludge/utils/validators/organization.validators";

export const addMemberCommand = addMemberValidator;

type CMD = z.infer<typeof addMemberCommand>;

export class AddMemberCommand {
  constructor(private readonly memberRepository: MemberRepository) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [existingMember, errMember] =
      await this.memberRepository.findByUserId(cmd.userId, organizationId);

    if (errMember)
      throw new InternalServerError(
        errMember,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (existingMember) throw new MemberAlreadyExistsException();

    const newMember = Member.create({
      userId: UUID.fromString(cmd.userId),
      role: "member",
      assignedBy: authContext.member.id,
      organizationId: authContext.organizationId,
    });

    const [, errSaving] = await this.memberRepository.insert(newMember);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.organizations.isr_on_save",
      );

    return newMember.values;
  }
}