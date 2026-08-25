import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FontsProvider } from "./fonts";
import { HeroUIProvider } from "./heroui";
import { QueryClientProvider } from "./query";
import { ORPCProvider } from "./orpc";
import { AuthProvider } from "./auth";

export function Integrations({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView>
      <QueryClientProvider>
        <AuthProvider>
          <ORPCProvider>
            <FontsProvider>
              <HeroUIProvider>{children}</HeroUIProvider>
            </FontsProvider>
          </ORPCProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
