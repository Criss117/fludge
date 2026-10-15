import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { Integrations } from "@/integrations";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";

function StackScreen() {
  const {
    data: { session },
  } = useAppState();
  const colors = useThemeColor();

  const queryClient = useQueryClient();

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
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={hasSession}>
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
