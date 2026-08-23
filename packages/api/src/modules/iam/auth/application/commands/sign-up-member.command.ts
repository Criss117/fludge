import { z } from "zod";

import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";
import type { AuthService } from "@fludge/auth";
import type { AddMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/add-member.command";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";

export const signUpMemberCommand = z.object({
  email: z.string({
    error: "El email es requerido",
  }),
  password: z.string({
    error: "La contraseña es requerida",
  }),
  phone: z.string({
    error: "El teléfono es requerido",
  }),
  name: z.string({
    error: "El nombre es requerido",
  }),
});

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
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al crear el usuario",
        cause: errNewUser.cause,
      });

    const [org, errAddMember] = await tryCatch(
      this.addMemberCommand.execute(loggedUserId, activeOrganization, {
        userId: newUser.user.id,
      }),
    );

    if (errAddMember)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al agregar el miembro",
        cause: errAddMember.cause,
      });

    return org;
  }
}
