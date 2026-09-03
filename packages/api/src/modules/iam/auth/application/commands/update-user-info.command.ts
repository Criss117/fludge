import type { z } from "zod";
import type { AuthService } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/trycatch";
import { updateUserInfoValidator } from "@fludge/utils/validators/auth.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

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
      throw new InternalServerError(err, "api_errors.auth.users.isr_on_update");
  }
}
