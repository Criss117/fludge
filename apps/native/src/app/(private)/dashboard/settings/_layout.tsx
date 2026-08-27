import { MaterialIcons } from "@/modules/shared/components/icons";
import { useAppTheme } from "@/modules/shared/context/app-theme-context";
import { Stack, useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { PressableFeedback } from "heroui-native/pressable-feedback";

export default function DashboardSettingsLayout() {
  const backgroundColor = useThemeColor("background");
  const { isDark } = useAppTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: backgroundColor,
        },
        headerStyle: {
          backgroundColor,
        },
        headerTitleStyle: {
          color: isDark ? "white" : "black",
        },
        headerShadowVisible: false,
        headerLeft: () => (
          <PressableFeedback onPress={() => router.back()} className="pr-4">
            <MaterialIcons
              name="arrow-back"
              size={20}
              className="dark:text-white"
            />
          </PressableFeedback>
        ),
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
