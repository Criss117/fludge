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

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <DatabaseProvider>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <FontsProvider>
              <QueryClientProvider>
                <AuthProvider>
                  <ORPCProvider>
                    <SyncDatabase>
                      <HeroUIProvider>
                        <AppThemeProvider>{children}</AppThemeProvider>
                      </HeroUIProvider>
                    </SyncDatabase>
                  </ORPCProvider>
                </AuthProvider>
              </QueryClientProvider>
            </FontsProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </DatabaseProvider>
    </NetworkProvider>
  );
}
