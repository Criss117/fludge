import "./i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { FontsProvider } from "./fonts";
import { HeroUIProvider } from "./heroui";
import { QueryClientProvider } from "./query";
import { ORPCProvider } from "./orpc";
import { AuthProvider } from "./auth";
import { AppThemeProvider } from "@/modules/shared/context/app-theme-context";
import { DatabaseProvider } from "./db";
import { SyncDatabase } from "./db/sync";
import { NetworkProvider } from "./network";
import { DependenciesProvider } from "./dependencies";

function UiProviders({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AppThemeProvider>{children}</AppThemeProvider>
    </HeroUIProvider>
  );
}

function NetworkProviders({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <DatabaseProvider>
        <QueryClientProvider>
          <AuthProvider>
            <ORPCProvider>
              <DependenciesProvider>
                <SyncDatabase>{children}</SyncDatabase>
              </DependenciesProvider>
            </ORPCProvider>
          </AuthProvider>
        </QueryClientProvider>
      </DatabaseProvider>
    </NetworkProvider>
  );
}

function MiscellaneousProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <FontsProvider>{children}</FontsProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <MiscellaneousProviders>
      <NetworkProviders>
        <UiProviders>{children}</UiProviders>
      </NetworkProviders>
    </MiscellaneousProviders>
  );
}
