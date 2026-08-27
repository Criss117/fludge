import { useAuth } from "@fludge/client/providers/auth.provider";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function PrivateLayout() {
  const { session } = useAuth();
  const backgroundColor = useThemeColor("background");

  const hasActiveOrganization = session.data?.activeOrganizationId !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor,
        },
      }}
    >
      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="dashboard" />
      </Stack.Protected>
      <Stack.Screen name="organization" />
    </Stack>
  );
}
