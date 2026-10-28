import { Host } from "@expo/ui";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { SPACING } from "@/lib/sp";

import { useThemeColor } from "../hooks/use-theme-color";
import { Icon, type iconName } from "./icon";
import { ThemedText } from "./themed-text";

interface Props {
  status: "active" | "inactive" | "discontinued";
  icon?: IconName;
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

interface ChipProps {
  label: string;
  color?: string;
  textColor?: string;
  icon?: IconName;
}

export function Chip({ label, color, textColor, icon }: ChipProps) {
  const colors = useThemeColor();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color ?? colors.outlineVariant,
        },
      ]}
    >
      {icon && (
        <Host matchContents>
          <Icon name={icon} size={SPACING.md} color={colors.primary} />
        </Host>
      )}
      <ThemedText
        variant="sm"
        style={{
          color: textColor ?? colors.primary,
        }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export function StatusChip({ status, icon }: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const config = stylesConfig[status];

  return (
    <Chip
      label={t(`helpers.status.${status}`)}
      color={colors[config.primary]}
      textColor={colors[config.secondary]}
      icon={icon}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    columnGap: SPACING.xs,
    alignSelf: "flex-start",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xl,
  },
  label: {},
});
