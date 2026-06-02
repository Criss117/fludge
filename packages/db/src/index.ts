import { env } from "@fludge/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schemas";

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema });
}

export const dbConnection = createDb();

export type DbConnection = Awaited<ReturnType<typeof createDb>>;
