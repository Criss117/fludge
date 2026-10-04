import type { AppSelect } from "@fludge/db/local-schemas/app.schema";

export interface AppRepository {
  find(): Promise<AppSelect>;

  save(
    values: Partial<{
      theme: "light" | "dark";
      loggedUserId: string | null;
      lastLoggedUserId: string | null;
      activeOrganizationId: string | null;
    }>,
  ): Promise<AppSelect>;

  clear(): Promise<AppSelect>;
}
