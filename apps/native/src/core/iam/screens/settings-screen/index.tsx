import {
  Button,
  Column,
  Host,
  OutlinedButton,
  OutlinedIconButton,
  Row,
  Spacer,
  Switch,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  fillMaxWidth,
  padding,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { type SyncData, useSyncCatalog } from "@fludge/client/sync/use-sync-catalog";
import { useSyncCommerce } from "@fludge/client/sync/use-sync-commerce";
import { useSyncIam } from "@fludge/client/sync/use-sync-iam";
import type { UseSuspenseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/core/shared/components/icon";
import { SectionCard } from "@/core/shared/components/section-card";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { SettingsHeader } from "./shared";
import {
  usePreferencesSection,
  useSessionSection,
  useSyncSectionItem,
} from "./use-settings-screen";

function PreferencesSection() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { actions, state, texts } = usePreferencesSection();

  return (
    <SectionCard title={texts.title}>
      <Row
        modifiers={[
          fillMaxWidth(),
          padding(SPACING.sm, 0, SPACING.sm, 0),
          clickable(actions.toggleTheme),
        ]}
      >
        <Column modifiers={[weight(1)]}>
          <ThemedNativeText>{t(texts.dark_mode.label)}</ThemedNativeText>
          <ThemedNativeText variant="muted">{t(texts.dark_mode.placeholder)}</ThemedNativeText>
        </Column>
        <Switch
          value={state.isDarkMode}
          onCheckedChange={actions.toggleTheme}
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

function SyncItem(props: Props) {
  const { t } = useTranslation();
  const { actions, state, texts } = useSyncSectionItem(props);

  return (
    <Row>
      <Column modifiers={[weight(1)]}>
        <Row
          horizontalArrangement={{
            spacedBy: SPACING.sm,
          }}
        >
          <Icon name={props.icon} size={24} />
          <ThemedNativeText>{t(texts.title)}</ThemedNativeText>
        </Row>
        {texts.last_synced_at.date !== null && (
          <>
            <ThemedNativeText variant="muted">{t(texts.last_synced_at.label)}</ThemedNativeText>
            <ThemedNativeText variant="muted">{texts.last_synced_at.date}</ThemedNativeText>
          </>
        )}
      </Column>
      <OutlinedIconButton onClick={actions.sync} enabled={!state.isDisabled}>
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
  const colors = useThemeColor();
  const { actions, state, texts } = useSessionSection();

  return (
    <SectionCard title={texts.title}>
      <OutlinedButton
        modifiers={[fillMaxWidth()]}
        onClick={actions.setNullActiveOrganization}
        enabled={!state.isPending}
      >
        <Icon name="switch" size={20} color={colors.primary} />
        <Spacer modifiers={[width(SPACING.sm)]} />
        <ThemedNativeText>{t(texts.switch_organization)}</ThemedNativeText>
      </OutlinedButton>
      <Button
        modifiers={[fillMaxWidth()]}
        colors={{
          containerColor: colors.error,
        }}
        onClick={actions.onSignOut}
        enabled={!state.isPending && state.isFullyOnline}
      >
        <Icon name="logout" size={20} color={colors.onError} />
        <Spacer modifiers={[width(SPACING.sm)]} />
        <ThemedNativeText color={colors.onError}>{t(texts.sign_out)}</ThemedNativeText>
      </Button>
    </SectionCard>
  );
}

export function SettingsScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: top,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SettingsHeader />

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
    paddingHorizontal: SPACING.sm,
  },
  contentContainer: {
    rowGap: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
  },
});
