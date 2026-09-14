import migrations from "../../../drizzle/migrations";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Text } from "@/modules/shared/components/app-text";

export const DATABASE_NAME = "local.db";

export const expoDb = openDatabaseSync(DATABASE_NAME, {
  enableChangeListener: true,
});

export const databaseService = drizzle(expoDb);

export type DatabaseService = typeof databaseService;

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  useDrizzleStudio(expoDb);

  const { success, error } = useMigrations(databaseService, migrations as any);

  if (error) return <Text>Error de migración: {error.message}</Text>;

  if (!success) return <LoadingScreen message="app.loading_database" />;

  return children;
}
