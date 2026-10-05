import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { Integrations } from "@/integrations";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { Stack } from "expo-router";

function StackScreen() {
  const { session } = useAuth();
  const colors = useThemeColor();

  const hasSession = session.data !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.primaryContainer,
        },
      }}
    >
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(auth)/index" />
      </Stack.Protected>

      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(auth)/sign-up" />
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
