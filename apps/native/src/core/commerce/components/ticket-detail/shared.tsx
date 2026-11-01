import { formatCurrency } from "@fludge/utils/format-currency";
import * as Haptics from "expo-haptics";
import { PressableOpacity, PressableScale } from "pressto";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { PresentationPriceKeyboardProps } from "./types";

const keyboard = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["c", "0", "del"],
] as const;

type KeyboardKey = (typeof keyboard)[number][number];

export function PresentationPriceKeyboard({
  defaultPrice,
  onSubmit,
  close,
}: PresentationPriceKeyboardProps) {
  const [value, setValue] = useState(defaultPrice.toString().split(""));
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const numberValue = Number(value.join("")) || 0;

  const keyWidth = useMemo(() => {
    const contentWidth = screenWidth - SPACING.md * 2;
    return (contentWidth - SPACING.sm * 2) / 3;
  }, [screenWidth]);

  const onKeyboardPress = (key: KeyboardKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (key) {
      case "c": {
        setValue([]);
        break;
      }
      case "del": {
        setValue((prev) => prev.slice(0, -1));
        break;
      }
      default: {
        setValue((prev) => [...prev, key]);
        break;
      }
    }
  };

  const handleUpdatePrice = () => {
    if (numberValue === 0) return;

    onSubmit(numberValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.valueContainer}>
        <PressableOpacity
          onPress={() => {
            setValue(defaultPrice.toString().split(""));
          }}
        >
          <ThemedText variant="muted">{formatCurrency(defaultPrice)}</ThemedText>
        </PressableOpacity>
        <ThemedText variant="h3">{formatCurrency(numberValue)}</ThemedText>
      </View>

      <View style={styles.keyboardContainer}>
        {keyboard.map((row, index) => (
          <View key={index.toString()} style={styles.keyboardRow}>
            {row.map((key) => (
              <PressableScale
                key={key}
                style={[
                  styles.keyboardButton,
                  { width: keyWidth, backgroundColor: colors.secondary },
                ]}
                onPress={() => onKeyboardPress(key)}
              >
                <ThemedText style={{ color: colors.onSecondary }}>{key}</ThemedText>
              </PressableScale>
            ))}
          </View>
        ))}
      </View>

      <View style={[styles.footer, { width: screenWidth }]}>
        <PressableScale
          style={[
            styles.applyButton,
            { backgroundColor: colors.primary, opacity: numberValue === 0 ? 0.5 : 1 },
          ]}
          disabled={numberValue === 0}
          onPress={handleUpdatePrice}
        >
          <ThemedText
            style={{
              color: colors.onPrimary,
            }}
          >
            {t("screens.pos.apply_new_price")}
          </ThemedText>
        </PressableScale>

        <PressableScale style={styles.keepButton} onPress={close}>
          <ThemedText
            style={{
              color: colors.primary,
            }}
          >
            {t("screens.pos.keep_original_price")}
          </ThemedText>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardRow: {
    flexDirection: "row",
    columnGap: SPACING.sm,
  },
  valueContainer: {
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  keyWrapper: {
    flex: 1,
    flexBasis: 0,
  },
  footer: {
    paddingHorizontal: SPACING.md,
  },
  container: {
    paddingTop: SPACING.xl,
  },
  keyboardContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
    rowGap: SPACING.sm,
  },
  keyboardButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SPACING.sm,
    height: SPACING["2xl"],
  },
  applyButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SPACING.xl,
    height: SPACING["2xl"],
  },
  keepButton: {
    justifyContent: "center",
    alignItems: "center",
    height: SPACING["2xl"],
  },
});
