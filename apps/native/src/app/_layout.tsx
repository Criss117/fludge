import "../globals.css";
import { Integrations } from "@/integrations";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useNetworkActivityDevTools } from "@rozenite/network-activity-plugin";
import { StatusBar } from "expo-status-bar";

function StackConfig() {
  const background = useThemeColor("background");
  const { session } = useAuth();

  const isLogged = session.data !== null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: background,
          },
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
    </>
  );
}

export default function RootLayout() {
  if (__DEV__) {
    useNetworkActivityDevTools();
  }
  return (
    <Integrations>
      <StackConfig />
    </Integrations>
  );
}
