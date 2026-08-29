import { BackButton } from "@/modules/shared/components/back-button";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function DashboardSettingsLayout() {
  const [background, foreground] = useThemeColor(["background", "foreground"]);

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: background,
        },
        headerStyle: {
          backgroundColor: background,
        },
        headerTitleStyle: {
          color: foreground,
        },
        headerShadowVisible: false,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Mi Cuenta",
        }}
      />
    </Stack>
  );
}
