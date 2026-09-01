import "../globals.css";
import "react-native-random-uuid";
import { Integrations } from "@/integrations";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useNetworkActivityDevTools } from "@rozenite/network-activity-plugin";
import { useAppTheme } from "@/modules/shared/context/app-theme-context";
import { Suspense } from "react";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";

function StackConfig() {
  const background = useThemeColor("background");
  const { session } = useAuth();
  const { isDark } = useAppTheme();

  const isLogged = session.data !== null;

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: background,
        },
        statusBarStyle: isDark ? "light" : "dark",
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isLogged}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
      <Stack.Protected guard={isLogged}>
        <Stack.Screen name="(private)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  if (__DEV__) {
    useNetworkActivityDevTools();
  }

  return (
    <Integrations>
      <Suspense fallback={<LoadingScreen message="Cargando datos..." />}>
        <StackConfig />
      </Suspense>
    </Integrations>
  );
}
