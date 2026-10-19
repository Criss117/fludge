import { useNetwork } from "@fludge/client/providers/network-status.provider";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

function OfflineScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="h1">{t("app.title")}</ThemedText>
      <ThemedText variant="muted">{t("helpers.network_status.offline")}</ThemedText>
    </ThemedView>
  );
}

export default function AuthLayout() {
  const colors = useThemeColor();
  const { isFullyOnline } = useNetwork();

  if (!isFullyOnline) return <OfflineScreen />;

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "slide_from_right",
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-up" />
    </Stack>
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
  },
  // items-center gap-2
  logo: {
    alignItems: "center",
    gap: 8,
  },
});
