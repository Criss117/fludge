import type { z } from "zod";
import type { AuthService } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";
import { updateUserInfoValidator } from "@fludge/utils/validators/auth.validators";

export const updateUserInfoCommand = updateUserInfoValidator;

type CMD = z.infer<typeof updateUserInfoCommand>;

export class UpdateUserInfoCommand {
  constructor(private readonly authService: AuthService) {}

  public async execute(headers: Headers, cmd: CMD) {
    const [, err] = await tryCatch(
      this.authService.api.updateUser({
        body: {
          name: cmd.name,
          phone: cmd.phone,
        },
        headers,
      }),
    );

    if (err)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al actualizar la información del usuario",
        cause: err.cause,
      });
  }
}
