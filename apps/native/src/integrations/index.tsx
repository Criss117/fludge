import "./i18n";

import { ThemeProvider } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useNavigationTheme } from "@/core/shared/hooks/use-theme-color";

import { DatabaseProvider } from "./db";
import { DependenciesProvider } from "./dependencies";
import { FontsProvider } from "./fonts";
import { NetworkProvider } from "./network";
import { ORPCProvider } from "./orpc";
import { QueryClientProvider } from "./query";
import { ToastProvider } from "./toast";

function UIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider value={useNavigationTheme()}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

function NetProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <DatabaseProvider>
        <DependenciesProvider>
          <ORPCProvider>
            <NetworkProvider>{children}</NetworkProvider>
          </ORPCProvider>
        </DependenciesProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  );
}

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider statusBarTranslucent={true}>
        <FontsProvider>
          <NetProvider>
            <UIProvider>{children}</UIProvider>
          </NetProvider>
        </FontsProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
