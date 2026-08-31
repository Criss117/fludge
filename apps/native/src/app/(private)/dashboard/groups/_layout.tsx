import { BackButton } from "@/modules/shared/components/back-button";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function GroupsLayout() {
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
          title: "Crear Grupo",
        }}
      />
      <Stack.Screen name="[groupid]/index" />
      <Stack.Screen
        name="[groupid]/update"
        options={{
          title: "Editar Grupo",
        }}
      />
      <Stack.Screen
        name="[groupid]/assign-members"
        options={{
          title: "Asignar Miembros",
        }}
      />
    </Stack>
  );
}
