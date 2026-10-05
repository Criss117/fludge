import type { TranslationKey } from "@fludge/i18n/index";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ThemedText } from "./themed-text";
import { Host } from "@expo/ui";
import { Icon } from "./icon";

const colors = {
  background: "#ffffff",
  accent: "#111827",
  muted: "#6b7280",
  danger: "#ef4444",
};

type FatalErrorScreenProps = {
  title?: TranslationKey;
  message?: TranslationKey;
  error?: Error;
  onRetry?: () => void;
};

export function FatalErrorScreen({
  title,
  message,
  error,
  onRetry,
}: FatalErrorScreenProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.iconWrapper}>
          <Host>
            <Icon name="error" size={48} color={colors.muted} />
          </Host>
        </ThemedText>

        <ThemedText style={styles.title}>
          {t(title ?? "app.errors.fatal.title")}
        </ThemedText>

        <ThemedText style={styles.message}>
          {t(message ?? "app.errors.fatal.message")}
        </ThemedText>

        {__DEV__ && error ? (
          <ThemedText style={styles.devError}>{error.message}</ThemedText>
        ) : null}
      </View>

      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <ThemedText style={styles.retryText}>
            {t("app.errors.fatal.retry")}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // bg-background flex-1 items-center justify-center gap-6 px-6
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  // items-center gap-2
  content: {
    alignItems: "center",
    gap: 8,
  },
  // text-6xl font-bold + style color
  iconWrapper: {
    fontSize: 60,
    lineHeight: 60,
    fontWeight: "700",
    color: colors.danger,
  },
  // text-accent text-center text-2xl font-bold
  title: {
    color: colors.accent,
    textAlign: "center",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
  },
  // text-muted text-center text-sm
  message: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  // text-muted mt-2 text-center text-xs opacity-70
  devError: {
    color: colors.muted,
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  // rounded-full px-6 py-3
  retryButton: {
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.accent, // ver nota: el original no tenía fondo
  },
  // text-background text-base font-semibold
  retryText: {
    color: colors.background,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
});
