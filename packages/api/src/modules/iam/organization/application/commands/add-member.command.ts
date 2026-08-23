import { z } from "zod";

import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization";
import { Member } from "../../domain/entities/members";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";

export const addMemberCommand = z.object({
  userId: z.uuid({
    error: "El id del usuario es requerido",
  }),
});

type CMD = z.infer<typeof addMemberCommand>;

export class AddMemberCommand {
  constructor(
    private readonly organizationRepository: PgOrganizationRepository,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    activeOrganization.addMember(
      Member.create({
        userId: UUID.fromString(cmd.userId),
        role: "member",
        assignedBy: loggedMember.id,
      }),
    );

    const [, errSaving] = await this.organizationRepository.save(
      activeOrganization,
      {
        onlySave: ["members"],
      },
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
