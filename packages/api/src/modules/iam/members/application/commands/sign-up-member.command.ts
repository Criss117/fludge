import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { auth } from "@fludge/auth";
import { signUpEmailCommand } from "@fludge/api/modules/iam/auth/application/commands/sign-up.command";
import type { EmailsAlreadyExistsQuery } from "@fludge/api/modules/iam/auth/application/queries/emails-already-exists.query";
import { tryCatch } from "@fludge/utils/trycatch";

export const signUpMemberCommand = signUpEmailCommand;

// .extend({
//   groupIds: z
//     .array(
//       z.uuid({
//         error: "Id de grupo no válido.",
//       }),
//     )
//     .min(1, {
//       error: "Debe especificar al menos un id de grupo.",
//     }),
// });

type CMD = z.infer<typeof signUpMemberCommand> & {
  organizationId: string;
  assignedBy: {
    memberId: string;
    name: string;
    email: string;
  };
};

export class SignUpMemberCommand {
  constructor(
    private readonly emailsAlreadyExistsQuery: EmailsAlreadyExistsQuery,
  ) {}

  public async execute(cmd: CMD, headers: Headers) {
    const { exists } = await this.emailsAlreadyExistsQuery.execute({
      emails: [cmd.email],
    });

    if (exists)
      throw new ORPCError("CONFLICT", {
        message: "El email ya está registrado",
      });

    const [newUser, error] = await tryCatch(
      auth.api.signUpEmail({
        headers,
        body: {
          email: cmd.email,
          password: cmd.password,
          name: cmd.name,
          phone: cmd.phone,
          isRoot: false,
        },
      }),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    const [memberData, errorAddMember] = await tryCatch(
      auth.api.addMember({
        headers,
        body: {
          organizationId: cmd.organizationId,
          userId: newUser.user.id,
          role: "member",
          assignedBy: cmd.assignedBy.memberId,
        },
      }),
    );

    if (errorAddMember)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorAddMember);

    return { ...newUser.user, memberId: memberData.id };
  }
}
