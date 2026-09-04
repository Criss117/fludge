import "./i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { FontsProvider } from "./fonts";
import { HeroUIProvider } from "./heroui";
import { QueryClientProvider } from "./query";
import { ORPCProvider } from "./orpc";
import { AuthProvider } from "./auth";
import { AppThemeProvider } from "@/modules/shared/context/app-theme-context";

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <QueryClientProvider>
          <ORPCProvider>
            <FontsProvider>
              <AuthProvider>
                <HeroUIProvider>
                  <AppThemeProvider>{children}</AppThemeProvider>
                </HeroUIProvider>
              </AuthProvider>
            </FontsProvider>
          </ORPCProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
