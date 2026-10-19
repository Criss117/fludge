import type { AppInsert, AppSelect } from "@fludge/db/local-schemas/app.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

import type { OrganizationSummary } from "./entities";

export type AppWithActiveOrganization = AppSelect & {
  activeOrganization: OrganizationSummary | null;
};

export interface AppRepository {
  find(): Promise<Result<AppWithActiveOrganization, RepositoryError>>;

  save(values: AppInsert): Promise<Result<AppWithActiveOrganization, RepositoryError>>;

  clear(): Promise<Result<AppWithActiveOrganization, RepositoryError>>;
}
