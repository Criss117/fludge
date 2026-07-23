import { desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

import type { DBConnection } from "@fludge/db";
import { group } from "@fludge/db/schemas/iam.schema";
import { tryCatch } from "@fludge/utils/trycatch";

type Query = {
  organizationId: string;
};

export class FindAllGroupsQuery {
  constructor(private readonly db: DBConnection) {}

  public async execute(query: Query) {
    const [data, error] = await tryCatch(
      this.db
        .select()
        .from(group)
        .where(eq(group.organizationId, query.organizationId))
        .orderBy(desc(group.createdAt)),
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Algo salio mal al buscar grupos",
      });

    return data;
  }
}
