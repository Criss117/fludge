import { count, inArray } from "drizzle-orm";
import { z } from "zod";
import { ORPCError } from "@orpc/client";

import type { DbConnection } from "@fludge/db";
import { user } from "@fludge/db/schemas/auth.schema";
import { tryCatch } from "@fludge/utils/trycatch";

export const emailsAlreadyExistsQuery = z.object({
  emails: z
    .array(
      z.email({
        error: "El email es requerido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un email.",
    }),
});
type CMD = z.infer<typeof emailsAlreadyExistsQuery>;

export class EmailsAlreadyExistsQuery {
  constructor(private readonly db: DbConnection) {}

  public async execute(cmd: CMD) {
    const [exists, errorExists] = await tryCatch(
      this.db
        .select({
          total: count(user.email),
        })
        .from(user)
        .where(inArray(user.email, cmd.emails)),
    );

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    const e = exists.at(0);

    if (!e)
      return {
        exists: false,
      };

    if (e.total !== cmd.emails.length)
      return {
        exists: false,
      };

    return {
      exists: true,
    };
  }
}
