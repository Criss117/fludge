import { Button, Form, Host, HStack, RNHostView, Section, Toggle, VStack } from "@expo/ui/swift-ui";
import {
  background,
  buttonBorderShape,
  buttonStyle,
  frame,
  listRowBackground,
  opacity,
  scrollContentBackground,
  scrollIndicators,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useSyncCatalog } from "@fludge/client/sync/use-sync-catalog";
import { useSyncCommerce } from "@fludge/client/sync/use-sync-commerce";
import { useSyncIam } from "@fludge/client/sync/use-sync-iam";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

import { SettingsHeader } from "./shared";
import type { SyncItemProps } from "./types";
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
    <Section
      header={<ThemedNativeText>{t(texts.title)}</ThemedNativeText>}
      modifiers={[listRowBackground(colors.onSecondary)]}
    >
      <Toggle
        label={t(texts.dark_mode.label)}
        isOn={state.isDarkMode}
        onIsOnChange={actions.toggleTheme}
        modifiers={[tint(colors.onPrimary)]}
      />
    </Section>
  );
}

function SessionSection() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { actions, state, texts } = useSessionSection();

  return (
    <Section
      header={<ThemedNativeText>{t(texts.title)}</ThemedNativeText>}
      modifiers={[listRowBackground(colors.onSecondary)]}
    >
      <Button
        onPress={actions.setNullActiveOrganization}
        modifiers={[opacity(state.isPending ? 0.5 : 1)]}
      >
        <HStack modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
          <Icon name="switch" size={15} color={colors.primary} />
          <ThemedNativeText>{t(texts.switch_organization)}</ThemedNativeText>
        </HStack>
      </Button>
      <Button
        onPress={actions.onSignOut}
        modifiers={[opacity(state.isPending || !state.isFullyOnline ? 0.5 : 1)]}
      >
        <HStack modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
          <Icon name="logout" size={15} color={colors.error} />
          <ThemedNativeText color={colors.error}>{t(texts.sign_out)}</ThemedNativeText>
        </HStack>
      </Button>
    </Section>
  );
}

function SyncItem(props: SyncItemProps) {
  const { t } = useTranslation();
  const { actions, state, texts } = useSyncSectionItem(props);
  const colors = useThemeColor();

  return (
    <HStack modifiers={[frame({ maxWidth: Infinity })]}>
      <VStack alignment="leading" modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}>
        <HStack>
          <Icon name={props.icon} size={18} color={colors.primary} />
          <ThemedNativeText>{t(texts.title)}</ThemedNativeText>
        </HStack>

        {texts.last_synced_at.date !== null && (
          <>
            <ThemedNativeText variant="muted">{t(texts.last_synced_at.label)}</ThemedNativeText>
            <ThemedNativeText variant="muted">{texts.last_synced_at.date}</ThemedNativeText>
          </>
        )}
      </VStack>
      <Button
        onPress={actions.sync}
        modifiers={[
          buttonStyle("glass"),
          buttonBorderShape("circle"),
          opacity(state.isDisabled ? 0.5 : 1),
        ]}
      >
        <Icon name="sync" size={18} color={colors.primary} />
      </Button>
    </HStack>
  );
}

function SyncSection() {
  const iamSync = useSyncIam();
  const catalogSync = useSyncCatalog();
  const commerceSync = useSyncCommerce();
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <Section
      header={<ThemedNativeText>{t("screens.settings.sections.sync.title")}</ThemedNativeText>}
      modifiers={[listRowBackground(colors.onSecondary)]}
    >
      <SyncItem syncHook={iamSync} module="iam" icon="security" />
      <SyncItem syncHook={catalogSync} module="catalog" icon="inventory" />
      <SyncItem syncHook={commerceSync} module="commerce" icon="inventory" />
    </Section>
  );
}

export function SettingsScreen() {
  const colors = useThemeColor();
  const {
    data: { session },
  } = useAppState();

  if (!session) return null;

  return (
    <Host style={{ flex: 1 }}>
      <Form
        modifiers={[
          scrollContentBackground("hidden"), // quita el gris del sistema
          background(colors.background), // ahora sí se ve tu color
          scrollIndicators("hidden"),
        ]}
      >
        <Section modifiers={[listRowBackground("transparent")]}>
          <RNHostView matchContents={{ vertical: true }}>
            <SettingsHeader />
          </RNHostView>
        </Section>

        <PreferencesSection />

        <SyncSection />

        <SessionSection />
      </Form>
    </Host>
  );
}
