import type { IncomingHttpHeaders } from "node:http";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import type { UpdateTeamSchema } from "@fludge/utils/validators/team.schemas";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { ORPCError } from "@orpc/client";
import { permissionsSchema } from "@fludge/utils/validators/permission.schemas";

export class UpdateTeamUseCase extends WithAuthHeader {
  public static instance: UpdateTeamUseCase;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public static getInstance(nodeHeaders: IncomingHttpHeaders) {
    if (!UpdateTeamUseCase.instance) {
      UpdateTeamUseCase.instance = new UpdateTeamUseCase(nodeHeaders);
    }
    return UpdateTeamUseCase.instance;
  }

  public async execute(values: UpdateTeamSchema) {
    const { data, error } = await tryCatch(
      auth.api.updateTeam({
        headers: this.headers,
        body: {
          data: {
            description: values.description,
            permissions: values.permissions,
            name: values.name,
          },
          teamId: values.id,
        },
      }),
    );

    if (error || !data)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: error?.message || "Failed to update team",
      });

    const validatedPermissions = permissionsSchema.safeParse(data.permissions);

    if (!validatedPermissions.success)
      throw new ORPCError("BAD_REQUEST", validatedPermissions.error);

    return { ...data, permissions: validatedPermissions.data };
  }
}

export function updateTeamUseCase(nodeHeaders: IncomingHttpHeaders) {
  return UpdateTeamUseCase.getInstance(nodeHeaders);
}
