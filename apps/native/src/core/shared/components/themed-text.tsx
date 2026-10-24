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
  nested?: boolean;
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
  nested,
  ...rest
}: ThemedNativeTextProps) {
  const textColor = useVariantColor(variant);

  return (
    <NativeText
      textStyle={{
        ...textStyle,
        ...TextVariants[variant],
        ...(nested ? null : TextLineHeight[variant]),
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

const TextLineHeight = StyleSheet.create({
  h1: {
    lineHeight: lh("5xl"),
  },
  h2: {
    lineHeight: lh("4xl"),
  },
  h3: {
    lineHeight: lh("3xl"),
  },
  h4: {
    lineHeight: lh("2xl"),
  },
  h5: {
    lineHeight: lh("xl"),
  },
  h6: {
    lineHeight: lh("lg"),
  },
  base: {
    lineHeight: lh("base"),
  },
  sm: {
    lineHeight: lh("sm"),
  },
  muted: {
    lineHeight: lh("sm"),
  },
  error: {
    lineHeight: lh("base"),
  },
});

const TextVariants = StyleSheet.create({
  h1: {
    fontFamily: GeistFonts.Bold,
    fontSize: fs("5xl"),
  },
  h2: {
    fontFamily: GeistFonts.Bold,
    fontSize: fs("4xl"),
  },
  h3: {
    fontFamily: GeistFonts.SemiBold,
    fontSize: fs("3xl"),
  },
  h4: {
    fontFamily: GeistFonts.SemiBold,
    fontSize: fs("2xl"),
  },
  h5: {
    fontFamily: GeistFonts.Medium,
    fontSize: fs("xl"),
  },
  h6: {
    fontFamily: GeistFonts.Medium,
    fontSize: fs("lg"),
  },
  base: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("base"),
  },
  sm: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("sm"),
  },
  muted: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("sm"),
  },
  error: {
    fontFamily: GeistFonts.Regular,
    fontSize: fs("base"),
  },
});
