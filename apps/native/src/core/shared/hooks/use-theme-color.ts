import { APP_COLORS } from "@/lib/theme";
import { useColorScheme } from "react-native";

export function useThemeColor() {
  const scheme = useColorScheme();

  const theme = scheme === "unspecified" ? "light" : scheme;

  return APP_COLORS[theme];
}
