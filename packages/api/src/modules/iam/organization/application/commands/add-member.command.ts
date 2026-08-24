import { z } from "zod";

import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import type { PgMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-member.repository";

export const addMemberCommand = z.object({
  userId: z.uuid({
    error: "El id del usuario es requerido",
  }),
});

type CMD = z.infer<typeof addMemberCommand>;

export class AddMemberCommand {
  constructor(private readonly memberRepository: PgMemberRepository) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const newMember = Member.create({
      userId: UUID.fromString(cmd.userId),
      role: "member",
      assignedBy: loggedMember.id,
    });

    activeOrganization.members.addMember(newMember);

    const [, errSaving] = await this.memberRepository.save(
      activeOrganization.id.toString(),
      newMember,
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
