import { BackButton } from "@/modules/shared/components/back-button";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function MemberLayout() {
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
          title: "Registrar un nuevo miembro",
        }}
      />
      <Stack.Screen name="[memberid]/update" />
      <Stack.Screen name="[memberid]/index" />
      <Stack.Screen
        name="[memberid]/assign-groups"
        options={{
          title: "Asignar Grupos",
        }}
      />
    </Stack>
  );
}
