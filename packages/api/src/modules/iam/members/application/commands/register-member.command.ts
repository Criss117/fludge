import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/trycatch";
import { signUpEmailCommand } from "@fludge/api/modules/iam/auth/application/commands/sign-up.command";
import type { EmailsAlreadyExistsQuery } from "@fludge/api/modules/iam/auth/application/queries/emails-already-exists.query";

export const registerMemberCommand = signUpEmailCommand;

type CMD = z.infer<typeof registerMemberCommand> & {
  organizationId: string;
  assignedBy: {
    memberId: string;
    name: string;
    email: string;
  };
};

export class RegisterMemberCommand {
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

    return { ...memberData, user: newUser.user, assignedBy: cmd.assignedBy };
  }
}
