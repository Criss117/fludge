import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "../../packages/db/src/local-schemas/*.schema.ts",
  out: "./drizzle",
});
