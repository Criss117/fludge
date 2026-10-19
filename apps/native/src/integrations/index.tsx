import "./i18n";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { DatabaseProvider } from "./db";
import { DependenciesProvider } from "./dependencies";
import { FontsProvider } from "./fonts";
import { NetworkProvider } from "./network";
import { ORPCProvider } from "./orpc";
import { QueryClientProvider } from "./query";
import { ToastProvider } from "./toast";

function UIProvider({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
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
