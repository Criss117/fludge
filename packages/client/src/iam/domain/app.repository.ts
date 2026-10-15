import type { AppInsert, AppSelect } from "@fludge/db/local-schemas/app.schema";
import type { OrganizationSummary } from "./entities";

export interface AppRepository {
  find(): Promise<
    AppSelect & {
      activeOrganization: OrganizationSummary | null;
    }
  >;

  save(values: AppInsert): Promise<
    AppSelect & {
      activeOrganization: OrganizationSummary | null;
    }
  >;

  clear(): Promise<
    AppSelect & {
      activeOrganization: OrganizationSummary | null;
    }
  >;
}
