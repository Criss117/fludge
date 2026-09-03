import { BackButton } from "@/modules/shared/components/back-button";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useTranslation } from "react-i18next";

export default function GroupsLayout() {
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
        name="create"
        options={{
          title: t("screens.groups.create_group.title"),
        }}
      />
      <Stack.Screen name="[groupid]/index" />
      <Stack.Screen
        name="[groupid]/update"
        options={{
          title: t("screens.groups.update_group.title"),
        }}
      />
      <Stack.Screen
        name="[groupid]/assign-members"
        options={{
          title: t("screens.groups.assign_members.title"),
        }}
      />
    </Stack>
  );
}
