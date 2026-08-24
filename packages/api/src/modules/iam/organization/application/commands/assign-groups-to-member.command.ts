import { z } from "zod";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";

export const assignGroupsToMemberCommand = z.object({
  memberId: z.uuid({
    error: "El id del grupo es requerido",
  }),
  groupIds: z
    .array(
      z.uuid({
        error: "El id del miembro es requerido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un miembro",
    }),
});

type CMD = z.infer<typeof assignGroupsToMemberCommand>;

export class AssignGroupsToMemberCommand {
  constructor(
    private readonly organizationRepository: PgOrganizationRepository,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    cmd.groupIds.forEach((gId) => {
      activeOrganization.addGroupMember(
        UUID.fromString(gId),
        UUID.fromString(cmd.memberId),
        loggedMember.id,
      );
    });

    const [, errSaving] =
      await this.organizationRepository.saveOnlyGroupMembers(
        activeOrganization,
      );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar los cambios",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
