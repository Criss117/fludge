import { and, desc, eq } from "drizzle-orm";
import { db } from "@fludge/db";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { session } from "@fludge/db/schema/auth";
import { organization } from "@fludge/db/schema/organization";
import type { SignInEmailSchema } from "@fludge/utils/validators/auth.schemas";

import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";

import type { IncomingHttpHeaders } from "node:http";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";

export class SignInEmailUseCase extends WithAuthHeader {
  constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  async execute(input: SignInEmailSchema) {
    const { data, error } = await tryCatch(
      auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
        headers: this.headers,
      }),
    );
    if (error) throw new InternalServerErrorException();

    const { data: sessions, error: sessionError } = await tryCatch(
      db
        .select()
        .from(session)
        .where(
          and(eq(session.userId, data.user.id), eq(session.token, data.token)),
        )
        .limit(1),
    );

    if (sessionError) throw new InternalServerErrorException();

    const currentSession = sessions?.at(0);

    if (!currentSession) throw new InternalServerErrorException();

    const { data: organizations, error: organizationsError } = await tryCatch(
      db
        .select()
        .from(organization)
        .where(eq(organization.rootUserId, data.user.id))
        .orderBy(desc(organization.createdAt)),
    );

    if (organizationsError) throw new InternalServerErrorException();

    return {
      ...currentSession,
      user: data.user,
      organizations,
    };
  }
}

export function signInEmailUseCase(nodeHeaders: IncomingHttpHeaders) {
  return new SignInEmailUseCase(nodeHeaders);
}
