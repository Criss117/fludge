import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import {
  Geist_100Thin,
  Geist_200ExtraLight,
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  Geist_900Black,
} from "@expo-google-fonts/geist";

SplashScreen.preventAutoHideAsync();

export const GeistFonts = {
  Thin: "geist-thin",
  ExtraLight: "geist-extralight",
  Light: "geist-light",
  Regular: "geist-regular",
  Medium: "geist-medium",
  SemiBold: "geist-semibold",
  Bold: "geist-bold",
  ExtraBold: "geist-extrabold",
  Black: "geist-black",
} as const;

export type GeistVariants = (typeof GeistFonts)[keyof typeof GeistFonts];

const FONT_VARIANTS: Record<GeistVariants, number> = {
  "geist-thin": Geist_100Thin,
  "geist-extralight": Geist_200ExtraLight,
  "geist-light": Geist_300Light,
  "geist-regular": Geist_400Regular,
  "geist-medium": Geist_500Medium,
  "geist-semibold": Geist_600SemiBold,
  "geist-bold": Geist_700Bold,
  "geist-extrabold": Geist_800ExtraBold,
  "geist-black": Geist_900Black,
} as const;

export function FontsProvider({ children }: { children: React.ReactNode }) {
  const [loaded, error] = useFonts(FONT_VARIANTS);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return children;
}
