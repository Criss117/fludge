import { tryCatch } from "@fludge/utils/trycatch";
import type { z } from "zod";
import type { AuthService } from "@fludge/auth";
import type { AddMemberCommand } from "@core/iam/application/commands/add-member.command";
import type { UserAuthContext } from "@core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { signUpValidator } from "@fludge/utils/validators/auth.validators";

export const signUpMemberCommand = signUpValidator;

type CMD = z.infer<typeof signUpMemberCommand>;

export class SignUpMemberCommand {
  constructor(
    private readonly authService: AuthService,
    private readonly addMemberCommand: AddMemberCommand,
  ) {}

  public async execute(
    headers: Headers,
    authContext: UserAuthContext,
    cmd: CMD,
  ) {
    const [newUser, errNewUser] = await tryCatch(
      this.authService.api.signUpEmail({
        body: {
          email: cmd.email,
          password: cmd.password,
          isRoot: false,
          phone: cmd.phone,
          name: cmd.name,
        },
        headers,
      }),
    );

    if (errNewUser)
      throw new InternalServerError(
        errNewUser,
        "api_errors.auth.users.isr_on_find",
      );

    return this.addMemberCommand.execute(authContext, {
      userId: newUser.user.id,
    });
  }
}