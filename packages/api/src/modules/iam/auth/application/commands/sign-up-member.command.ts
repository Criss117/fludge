import { tryCatch } from "@fludge/utils/trycatch";
import type { z } from "zod";
import type { AuthService } from "@fludge/auth";
import type { AddMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/add-member.command";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { signUpValidator } from "@fludge/utils/validators/auth.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const signUpMemberCommand = signUpValidator;

type CMD = z.infer<typeof signUpMemberCommand>;

export class SignUpMemberCommand {
  constructor(
    private readonly authService: AuthService,
    private readonly addMemberCommand: AddMemberCommand,
  ) {}

  public async execute(
    headers: Headers,
    loggedUserId: string,
    activeOrganization: Organization,
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

    const org = await this.addMemberCommand.execute(
      loggedUserId,
      activeOrganization,
      {
        userId: newUser.user.id,
      },
    );

    return org;
  }
}
