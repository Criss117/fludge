import {
  Button,
  Column,
  ElevatedCard,
  Host,
  OutlinedButton,
  OutlinedIconButton,
  RNHostView,
  Row,
  Spacer,
  Switch,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  padding,
  paddingAll,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import { type SyncData, useSyncCatalog } from "@fludge/client/sync/use-sync-catalog";
import { useSyncCommerce } from "@fludge/client/sync/use-sync-commerce";
import { useSyncIam } from "@fludge/client/sync/use-sync-iam";
import type { TranslationKey } from "@fludge/i18n/index";
import type { UseSuspenseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/core/shared/components/avatar";
import { Icon, type IconName } from "@/core/shared/components/icon";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

function PreferencesSection() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { setTheme, data } = useAppState();

  const toggleTheme = () => {
    setTheme.mutate({
      theme: data.theme === "light" ? "dark" : "light",
    });
  };

  return (
    <SectionCard title="screens.settings.sections.preferences.title">
      <Row
        modifiers={[fillMaxWidth(), padding(SPACING.sm, 0, SPACING.sm, 0), clickable(toggleTheme)]}
      >
        <Column modifiers={[weight(1)]}>
          <ThemedNativeText>
            {t("screens.settings.sections.preferences.dark_mode.label")}
          </ThemedNativeText>
          <ThemedNativeText variant="muted">
            {t("screens.settings.sections.preferences.dark_mode.placeholder")}
          </ThemedNativeText>
        </Column>
        <Switch
          value={data.theme === "dark"}
          onCheckedChange={() => {
            toggleTheme();
          }}
          colors={{
            checkedTrackColor: colors.primary,
            uncheckedTrackColor: colors.surface,
            checkedBorderColor: colors.primary,
            uncheckedBorderColor: colors.primary,
            uncheckedThumbColor: colors.secondary,
          }}
        />
      </Row>
    </SectionCard>
  );
}

interface Props {
  syncHook: UseSuspenseQueryResult<SyncData, Error>;
  module: "iam" | "catalog" | "commerce";
  icon: IconName;
}

function SyncItem({ syncHook, module, icon }: Props) {
  const { t } = useTranslation();
  const { isInternetReachable } = useNetwork();
  const mutationToast = useMutationToast(`sync-toast-${module}`);

  const isDisabled = syncHook.isRefetching || !isInternetReachable;

  const translationBaseKey = `screens.settings.sections.sync.${module}` as const;

  function sync() {
    if (!isInternetReachable) {
      mutationToast.showError(
        `${translationBaseKey}.on_error.title` as TranslationKey,
        "helpers.no_conection",
      );
      return;
    }

    if (syncHook.isRefetching) return;

    mutationToast.showPending(`${translationBaseKey}.refetching` as TranslationKey);
    syncHook
      .refetch()
      .then(() => {
        mutationToast.showSuccess(`${translationBaseKey}.on_success` as TranslationKey);
      })
      .catch(() => {
        mutationToast.showError(
          `${translationBaseKey}.on_error.title` as TranslationKey,
          `${translationBaseKey}.on_error.description` as TranslationKey,
        );
      });
  }

  return (
    <Row>
      <Column modifiers={[weight(1)]}>
        <Row
          horizontalArrangement={{
            spacedBy: SPACING.sm,
          }}
        >
          <Icon name={icon} size={24} />
          <ThemedNativeText>{t(`${translationBaseKey}.title` as TranslationKey)}</ThemedNativeText>
        </Row>
        {syncHook.data.syncedAt !== null && (
          <ThemedNativeText variant="muted">
            {t(`${translationBaseKey}.last_synced_at` as TranslationKey)}
            {syncHook.data.syncedAt.toLocaleDateString()}
          </ThemedNativeText>
        )}
      </Column>
      <OutlinedIconButton onClick={sync} enabled={!isDisabled}>
        <Icon name="sync" size={20} />
      </OutlinedIconButton>
    </Row>
  );
}

function SyncSection() {
  const iamSync = useSyncIam();
  const catalogSync = useSyncCatalog();
  const commerceSync = useSyncCommerce();

  return (
    <SectionCard title="screens.settings.sections.sync.title">
      <SyncItem syncHook={iamSync} module="iam" icon="security" />
      <SyncItem syncHook={catalogSync} module="catalog" icon="inventory_2" />
      <SyncItem syncHook={commerceSync} module="commerce" icon="group" />
    </SectionCard>
  );
}

function SessionSection() {
  const { t } = useTranslation();
  const { signOut, switchActiveOrganization } = useAppState();
  const colors = useThemeColor();

  const setNullActiveOrganization = () => {
    switchActiveOrganization.mutate({ activeOrganizationId: null });
  };

  const onSignOut = () => {
    signOut.mutate();
  };

  const isPending = switchActiveOrganization.isPending || signOut.isPending;

  return (
    <SectionCard title="screens.settings.sections.session.title">
      <OutlinedButton
        modifiers={[fillMaxWidth()]}
        onClick={setNullActiveOrganization}
        enabled={!isPending}
      >
        <Icon name="switch" size={20} color={colors.primary} />
        <Spacer modifiers={[width(SPACING.sm)]} />
        <ThemedNativeText>
          {t("screens.settings.sections.session.switch_organization")}
        </ThemedNativeText>
      </OutlinedButton>
      <Button
        modifiers={[fillMaxWidth()]}
        colors={{
          containerColor: colors.error,
        }}
        onClick={onSignOut}
        enabled={!isPending}
      >
        <Icon name="logout" size={20} color={colors.onError} />
        <Spacer modifiers={[width(SPACING.sm)]} />
        <ThemedNativeText color={colors.onError}>
          {t("screens.settings.sections.session.sign_out")}
        </ThemedNativeText>
      </Button>
    </SectionCard>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { top } = useSafeAreaInsets();
  const {
    data: { session },
  } = useAppState();

  if (!session) return null;

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: top + SPACING.md,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <ElevatedCard
            colors={{
              containerColor: colors.onSecondary,
            }}
          >
            <Column
              modifiers={[paddingAll(SPACING.md), fillMaxWidth()]}
              horizontalAlignment="center"
            >
              <RNHostView matchContents>
                <Avatar name={session.user.name} size={SPACING["4xl"]} />
              </RNHostView>
              <ThemedNativeText variant="h4">{session.user.name}</ThemedNativeText>
              <ThemedNativeText variant="muted">{session.user.email}</ThemedNativeText>
            </Column>
          </ElevatedCard>
        </Host>

        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Column
            verticalArrangement={{
              spacedBy: SPACING.md,
            }}
          >
            <PreferencesSection />

            <SyncSection />

            <SessionSection />
          </Column>
        </Host>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  contentContainer: {
    rowGap: SPACING.xl,
  },
});
