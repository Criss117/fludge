import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function OrganizationLayout() {
  const { session } = useAuth();
  const { hasOrganizations } = useOrganization();

  const [background, foreground] = useThemeColor(["background", "foreground"]);

  const userIsRoot = !!session.data?.user.isRoot;

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        title: "Fludge",
        headerStyle: {
          backgroundColor: background,
        },
        contentStyle: {
          backgroundColor: background,
        },
        headerTitleStyle: {
          color: foreground,
        },
        animation: "fade",
      }}
    >
      <Stack.Protected guard={hasOrganizations}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={userIsRoot}>
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}
