import { useFindActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function DashboardLayout() {
  const backgroundColor = useThemeColor("background");
  useFindActiveOrganization();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor,
        },

        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
