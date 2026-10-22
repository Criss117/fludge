import { Text as NativeText, type TextProps as NativeTextProps } from "@expo/ui";
import { Children } from "react";
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";
import { fs, lh } from "@/lib/typography";

export type TextVariantsKey = keyof typeof TextVariants;

export type ThemedNativeTextProps = Omit<NativeTextProps, "children"> & {
  variant?: keyof typeof TextVariants;
  color?: string;
  children?: React.ReactNode;
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

function childrenToString(children: React.ReactNode): string {
  return Children.toArray(children)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
    .join("");
}

export function ThemedNativeText({
  variant = "base",
  color,
  textStyle,
  children,
  ...rest
}: ThemedNativeTextProps) {
  const textColor = useVariantColor(variant);

  return (
    <NativeText
      textStyle={{
        ...textStyle,
        ...TextVariants[variant],
        color: color ?? textColor,
      }}
      {...rest}
    >
      {childrenToString(children)}
    </NativeText>
  );
}

export function ThemedText({ style, variant = "base", ...rest }: ThemedTextProps) {
  const textColor = useVariantColor(variant);

  return <RNText style={[TextVariants[variant], { color: textColor }, style]} {...rest} />;
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
