import { useAppTheme } from "@/modules/shared/context/app-theme-context";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function OrganizationLayout() {
  const { session } = useAuth();

  const [background, foreground] = useThemeColor(["background", "foreground"]);
  const { isDark } = useAppTheme();

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
      <Stack.Protected guard={userIsRoot}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Screen name="select" />
    </Stack>
  );
}
