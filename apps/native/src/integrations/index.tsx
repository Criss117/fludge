import "./i18n";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { FontsProvider } from "./fonts";
import { QueryClientProvider } from "./query";
import { DatabaseProvider } from "./db";
import { NetworkProvider } from "./network";
import { AuthProvider } from "./auth";
import { ORPCProvider } from "./orpc";
import { DependenciesProvider } from "./dependencies";

function NetProvider({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <QueryClientProvider>
        <DatabaseProvider>
          <DependenciesProvider>
            <AuthProvider>
              <ORPCProvider>{children}</ORPCProvider>
            </AuthProvider>
          </DependenciesProvider>
        </DatabaseProvider>
      </QueryClientProvider>
    </NetworkProvider>
  );
}

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider statusBarTranslucent={true}>
        <FontsProvider>
          <NetProvider>{children}</NetProvider>
        </FontsProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
