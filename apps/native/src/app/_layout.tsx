import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { Stack } from "expo-router";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { Integrations } from "@/integrations";

function StackScreen() {
  const {
    data: { session },
  } = useAppState();
  const colors = useThemeColor();

  const hasSession = session !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Protected guard={!hasSession} redirectTo="/dashboard/(tabs)">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={hasSession} redirectTo="/(auth)">
        <Stack.Screen name="dashboard" />
      </Stack.Protected>
    </Stack>
  );
}

export default function TabLayout() {
  return (
    <Integrations>
      <StackScreen />
    </Integrations>
  );
}
