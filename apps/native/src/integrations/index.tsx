import "./i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { FontsProvider } from "./fonts";
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
    <>
      <AppThemeProvider>{children}</AppThemeProvider>
    </>
  );
}

function NetworkProviders({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <DatabaseProvider>
        <DependenciesProvider>
          <QueryClientProvider>
            <AuthProvider>
              <ORPCProvider>{children}</ORPCProvider>
            </AuthProvider>
          </QueryClientProvider>
        </DependenciesProvider>
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
