import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
} from "react-native";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import {
  Text as NativeText,
  type TextProps as NativeTextProps,
} from "@expo/ui/jetpack-compose";
import { fs, lh } from "@/lib/typography";

export type TextVariantsKey = keyof typeof TextVariants;

export type ThemedNativeTextProps = NativeTextProps & {
  variant?: TextVariantsKey;
};

export type ThemedTextProps = RNTextProps & {
  variant?: TextVariantsKey;
};

function useVariantColor(variant: TextVariantsKey) {
  const colors = useThemeColor();

  switch (variant) {
    case "muted":
      return colors.outline;
    case "error":
      return colors.error;
    default:
      return colors.inverseSurface;
  }
}

export function ThemedNativeText({
  style,
  variant = "base",
  color,
  ...rest
}: ThemedNativeTextProps) {
  const textColor = useVariantColor(variant);

  return (
    <NativeText
      style={{
        ...TextVariants[variant],
        ...style,
      }}
      color={color ?? textColor}
      {...rest}
    />
  );
}

export function ThemedText({
  style,
  variant = "base",
  ...rest
}: ThemedTextProps) {
  const textColor = useVariantColor(variant);

  return (
    <RNText
      style={[TextVariants[variant], { color: textColor }, style]}
      {...rest}
    />
  );
}

const TextVariants = StyleSheet.create({
  h1: {
    fontFamily: GeistFonts.Bold,
    fontSize: fs("5xl"),
    lineHeight: lh("5xl"),
  },
  h2: {
    fontFamily: GeistFonts.Bold,
    fontSize: fs("4xl"),
    lineHeight: lh("4xl"),
  },
  h3: {
    fontFamily: GeistFonts.SemiBold,
    fontSize: fs("3xl"),
    lineHeight: lh("3xl"),
  },
  h4: {
    fontFamily: GeistFonts.SemiBold,
    fontSize: fs("2xl"),
    lineHeight: lh("2xl"),
  },
  h5: {
    fontFamily: GeistFonts.Medium,
    fontSize: fs("xl"),
    lineHeight: lh("xl"),
  },
  h6: {
    fontFamily: GeistFonts.Medium,
    fontSize: fs("lg"),
    lineHeight: lh("lg"),
  },
  base: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("base"),
    lineHeight: lh("base"),
  },
  sm: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("sm"),
    lineHeight: lh("sm"),
  },
  muted: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("sm"),
    lineHeight: lh("sm"),
  },
  error: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("base"),
    lineHeight: lh("base"),
  },
});
