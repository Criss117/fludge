import { BackButton } from "@/modules/shared/components/back-button";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useTranslation } from "react-i18next";

export default function MemberLayout() {
  const { t } = useTranslation();
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
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="register"
        options={{
          title: t("screens.members.register_member.title"),
        }}
      />
      <Stack.Screen name="[memberid]/update" />
      <Stack.Screen name="[memberid]/index" />
      <Stack.Screen
        name="[memberid]/assign-groups"
        options={{
          title: t("screens.members.assign_groups.title"),
        }}
      />
    </Stack>
  );
}
