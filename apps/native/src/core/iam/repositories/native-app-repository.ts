import type { AppRepository } from "@fludge/client/iam/domain/app.repository";
import type { OrganizationSummary } from "@fludge/client/iam/domain/entities";
import type { AppInsert, AppSelect } from "@fludge/db/local-schemas/app.schema";
import { app, APP_ID, defaultSyncState } from "@fludge/db/local-schemas/app.schema";
import { localOrganization } from "@fludge/db/local-schemas/shared.schema";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Result, tryCatch } from "@fludge/utils/trycatch";
import { eq, getColumns } from "drizzle-orm";

import type { DatabaseService } from "@/integrations/db";

type AppWithActiveOrganization = AppSelect & {
  activeOrganization: OrganizationSummary | null;
};

export class NativeAppRepository implements AppRepository {
  constructor(private readonly db: DatabaseService) {}

  public async find(): Promise<Result<AppWithActiveOrganization, RepositoryError>> {
    return tryCatch(
      () => {
        const [appData] = this.db
          .select({
            ...getColumns(app),
            activeOrganization: getColumns(localOrganization),
          })
          .from(app)
          .leftJoin(localOrganization, eq(app.activeOrganizationId, localOrganization.id))
          .where(eq(app.id, APP_ID))
          .limit(1)
          .all();

        if (appData) return appData;

        const [newApp] = this.db
          .insert(app)
          .values({
            activeOrganizationId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            theme: "light",
            session: null,
            lastLoggedUserId: null,
          })
          .returning()
          .all();

        let organization: OrganizationSummary | null = null;

        if (newApp.activeOrganizationId) {
          const organizationRows = this.db
            .select()
            .from(localOrganization)
            .where(eq(localOrganization.id, newApp.activeOrganizationId))
            .all();

          const organizationRow = organizationRows.at(0);

          if (organizationRow) organization = organizationRow;
        }

        return {
          ...newApp,
          activeOrganization: organization,
        };
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_find", raw),
      },
    );
  }

  public async save(
    values: AppInsert,
  ): Promise<Result<AppWithActiveOrganization, RepositoryError>> {
    return tryCatch(
      () => {
        const [appData] = this.db
          .insert(app)
          .values({
            ...values,
            id: APP_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: app.id,
            set: { ...values, updatedAt: new Date() },
          })
          .returning()
          .all();

        let organization: OrganizationSummary | null = null;

        if (appData.activeOrganizationId) {
          const organizationRows = this.db
            .select()
            .from(localOrganization)
            .where(eq(localOrganization.id, appData.activeOrganizationId))
            .all();

          organization = organizationRows.at(0) ?? null;
        }

        return { ...appData, activeOrganization: organization };
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_save", raw),
      },
    );
  }

  public async clear(): Promise<Result<AppWithActiveOrganization, RepositoryError>> {
    return tryCatch(
      () => {
        const [appData] = this.db
          .update(app)
          .set({
            theme: "light",
            activeOrganizationId: null,
            lastLoggedUserId: null,
            session: null,
            updatedAt: new Date(),
            syncState: defaultSyncState,
          })
          .where(eq(app.id, APP_ID))
          .returning()
          .all();

        return { ...appData, activeOrganization: null };
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.iam.organizations.isr_on_delete", raw),
      },
    );
  }
}
