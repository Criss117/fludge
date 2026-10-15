import type { DatabaseService } from "@/integrations/db";
import type { AppRepository } from "@fludge/client/iam/domain/app.repository";
import type { OrganizationSummary } from "@fludge/client/iam/domain/entities";

import {
  app,
  APP_ID,
  AppInsert,
  defaultSyncState,
  type AppSelect,
} from "@fludge/db/local-schemas/app.schema";
import { localOrganization } from "@fludge/db/local-schemas/shared.schema";
import { eq, getColumns } from "drizzle-orm";

export class NativeAppRepository implements AppRepository {
  constructor(private readonly db: DatabaseService) {}

  public async find(): Promise<
    AppSelect & {
      activeOrganization: OrganizationSummary | null;
    }
  > {
    const [appData] = this.db
      .select({
        ...getColumns(app),
        activeOrganization: getColumns(localOrganization),
      })
      .from(app)
      .leftJoin(
        localOrganization,
        eq(app.activeOrganizationId, localOrganization.id),
      )
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
  }

  public async save(values: AppInsert): Promise<
    AppSelect & {
      activeOrganization: OrganizationSummary | null;
    }
  > {
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
  }

  public async clear(): Promise<
    AppSelect & {
      activeOrganization: OrganizationSummary | null;
    }
  > {
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
  }
}
