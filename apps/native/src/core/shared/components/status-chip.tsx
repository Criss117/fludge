import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { SPACING } from "@/lib/sp";

import { useThemeColor } from "../hooks/use-theme-color";
import { ThemedText } from "./themed-text";

interface Props {
  status: "active" | "inactive" | "discontinued";
}

const stylesConfig = {
  active: {
    primary: "success",
    secondary: "onSuccess",
  },
  inactive: {
    primary: "surface",
    secondary: "onSurface",
  },
  discontinued: {
    primary: "success",
    secondary: "onSuccess",
  },
} as const;

export function StatusChip({ status }: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const config = stylesConfig[status];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors[config.primary],
        },
      ]}
    >
      <ThemedText variant="sm" style={[styles.label, { color: colors[config.secondary] }]}>
        {t(`helpers.status.${status}`)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xl,
  },
  label: {},
});
