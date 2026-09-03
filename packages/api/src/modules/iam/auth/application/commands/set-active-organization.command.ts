import type { z } from "zod";
import type { EnsureOrganizationExistsService } from "@fludge/api/modules/iam/organization/application/services/ensure-organization-exists.service";
import type { DatabaseService } from "@fludge/db";
import { tryCatch } from "@fludge/utils/trycatch";
import { session } from "@fludge/db/schema/auth.schema";
import { eq, and } from "drizzle-orm";
import { setActiveOrganizationValidator } from "@fludge/utils/validators/auth.validators";
import { OrganizationNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-not-found.exception";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const setActiveOrganizationCommand = setActiveOrganizationValidator;

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
      throw new InternalServerError(
        errExists,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (!exists) throw new OrganizationNotFoundException();

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
      throw new InternalServerError(
        errSession,
        "api_errors.auth.sessions.isr_on_update",
      );
  }
}
