import { Host } from "@expo/ui";
import { useActiveTicket, useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import { formatCurrency } from "@fludge/utils/format-currency";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { PressableOpacity } from "pressto";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { TicketDetail } from "@/core/commerce/components/ticket-detail";
import { Icon } from "@/core/shared/components/icon";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedScrollView, ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

export function CartScreen() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const router = useRouter();
  const activeTicket = useActiveTicket();
  const clearTicket = useTicketStore((s) => s.clearTicket);

  const handleClear = async () => {
    if (!activeTicket) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    clearTicket(activeTicket.id);
    router.back();
  };

  const back = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const charge = () => {
    if (!activeTicket || activeTicket.items.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/pos/charge");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Host matchContents>
            <Icon name="inventory" size={24} color={colors.primary} />
          </Host>
          <View>
            <ThemedText variant="h5">{t("screens.pos.ticket_summary.title")}</ThemedText>
            <ThemedText variant="muted">
              {t("screens.pos.ticket_summary.items_count", {
                count: activeTicket?.items.length ?? 0,
              })}
            </ThemedText>
          </View>
        </View>

        <PressableOpacity onPress={back}>
          <View style={styles.backIcon}>
            <Host matchContents ignoreSafeArea="all">
              <Icon name="keyboard-arrow-up" size={15} color={colors.onSurface} />
            </Host>
          </View>
        </PressableOpacity>
      </View>

      <ThemedScrollView
        style={styles.list}
        contentContainerStyle={styles.lisContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        {activeTicket?.items.map((item) => (
          <TicketDetail item={item} key={item.id} />
        ))}
      </ThemedScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTittle}>
          <ThemedText variant="h6">{t("screens.pos.ticket_summary.total")}</ThemedText>
          <ThemedText variant="h5">{formatCurrency(activeTicket?.total ?? 0)}</ThemedText>
        </View>
        <View style={styles.footerContent}>
          <PressableOpacity
            onPress={handleClear}
            style={[
              styles.button,
              {
                backgroundColor: colors.onSecondary,
              },
            ]}
          >
            <ThemedText>{t("screens.pos.ticket_summary.clear")}</ThemedText>
          </PressableOpacity>

          <PressableOpacity
            onPress={charge}
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
              },
            ]}
            disabled={activeTicket?.items.length === 0}
          >
            <ThemedText
              style={{
                color: colors.onPrimary,
              }}
            >
              {t("screens.pos.ticket_summary.charge")}
            </ThemedText>
          </PressableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.xl,
    rowGap: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    flexDirection: "row",
    columnGap: SPACING.sm,
  },
  backIcon: {
    height: SPACING.xl,
    width: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  lisContent: {
    paddingHorizontal: SPACING.md,
    rowGap: SPACING.xl,
  },
  footer: {
    rowGap: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  footerTittle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerContent: { flexDirection: "row", justifyContent: "space-between", columnGap: SPACING.md },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.xl,
  },
});
