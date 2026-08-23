import { z } from "zod";
import type { EnsureOrganizationExistsService } from "@fludge/api/modules/iam/organization/application/services/ensure-organization-exists.service";
import { ORPCError } from "@orpc/server";
import type { DatabaseService } from "@fludge/db";
import { tryCatch } from "@fludge/utils/trycatch";
import { session } from "@fludge/db/schema/auth.schema";
import { eq, and } from "drizzle-orm";

export const setActiveOrganizationCommand = z.object({
  organizationId: z.uuid({
    error: "La organización no es válida",
  }),
});

type CMD = z.infer<typeof setActiveOrganizationCommand> & {
  loggedUserId: string;
  sessionId: string;
};

export class SetActiveOrganizationCommand {
  constructor(
    private readonly ensureOrganizationExistsService: EnsureOrganizationExistsService,
    private readonly db: DatabaseService,
  ) {}

  public async execute(cmd: CMD) {
    const [exists, errExists] =
      await this.ensureOrganizationExistsService.byIdAndUserId(
        cmd.organizationId,
        cmd.loggedUserId,
      );

    if (errExists)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener la organización",
        cause: errExists.cause,
      });

    if (!exists)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontró la organización",
      });

    const [, errSession] = await tryCatch(
      this.db
        .update(session)
        .set({
          activeOrganizationId: cmd.organizationId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(session.userId, cmd.loggedUserId),
            eq(session.id, cmd.sessionId),
          ),
        ),
    );

    if (errSession)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al actualizar la sesión",
        cause: errSession.cause,
      });
  }
}
