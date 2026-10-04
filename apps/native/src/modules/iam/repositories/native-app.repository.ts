import { DatabaseService } from "@/integrations/db";
import type { AppRepository } from "@fludge/client/iam/domain/app.repository";

import {
  app,
  APP_ID,
  type AppSelect,
} from "@fludge/db/local-schemas/app.schema";
import { eq } from "drizzle-orm";

export class NativeAppRepository implements AppRepository {
  constructor(private readonly db: DatabaseService) {}

  public async find(): Promise<AppSelect> {
    let [appData] = this.db.select().from(app).limit(1).all();

    if (!appData) {
      [appData] = this.db
        .insert(app)
        .values({
          theme: "light",
          loggedUserId: null,
          lastLoggedUserId: null,
          activeOrganizationId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .all();
    }

    return appData;
  }

  public async save(
    values: Partial<{
      theme: "light" | "dark";
      loggedUserId: string | null;
      lastLoggedUserId: string | null;
      activeOrganizationId: string | null;
    }>
  ): Promise<AppSelect> {
    const [appData] = this.db
      .insert(app)
      .values({
        ...values,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: app.id,
        set: { ...values, updatedAt: new Date() },
      })
      .returning()
      .all();

    return appData;
  }

  public async clear(): Promise<AppSelect> {
    const [appData] = this.db
      .update(app)
      .set({
        theme: "light",
        loggedUserId: null,
        lastLoggedUserId: null,
        activeOrganizationId: null,
        updatedAt: new Date(),
      })
      .where(eq(app.id, APP_ID))
      .returning()
      .all();

    return appData;
  }
}
