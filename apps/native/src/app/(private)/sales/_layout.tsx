import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function SaleLayout() {
  const [background, foreground] = useThemeColor(["background", "foreground"]);

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
        fontFamily: GeistFonts.SemiBold,
      },
      headerShadowVisible: false,
      animation: "slide_from_right",
    }}
  >
    <Stack.Screen name="index" />
  </Stack>;
}
