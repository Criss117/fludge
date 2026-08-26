import { useAuth } from "@fludge/client/providers/auth.provider";
import { Stack } from "expo-router";

export default function PrivateLayout() {
  const { session } = useAuth();

  const hasActiveOrganization = session.data?.activeOrganizationId !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={hasActiveOrganization}>
        <Stack.Screen name="dashboard" />
      </Stack.Protected>
      <Stack.Protected guard={!hasActiveOrganization}>
        <Stack.Screen name="organization" />
      </Stack.Protected>
    </Stack>
  );
}
