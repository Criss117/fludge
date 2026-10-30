import { Button, Host, Spacer } from "@expo/ui/jetpack-compose";
import { width } from "@expo/ui/jetpack-compose/modifiers";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  ContactSection,
  CreditSection,
  GeneralInformationSection,
} from "@/core/commerce/components/customer-form-sections";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { CustomerFormScreenProps } from "./types";
import { useCustomerFormScreen } from "./use-customer-form";

export function CustomerFormScreen(props: CustomerFormScreenProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const { actions, state, texts } = useCustomerFormScreen(props);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Host matchContents={{ vertical: true }} style={styles.sectionsContainer}>
          <GeneralInformationSection form={state.form} />
        </Host>
        <Host matchContents={{ vertical: true }} style={styles.sectionsContainer}>
          <ContactSection form={state.form} />
        </Host>
        <Host matchContents={{ vertical: true }} style={styles.sectionsContainer}>
          <CreditSection form={state.form} />
        </Host>
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            onClick={actions.submit}
          >
            <Icon name={texts.iconName} size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>{t(texts.submit)}</ThemedNativeText>
          </Button>
        </Host>
        <KeyboardSpacerView />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingHorizontal: SPACING.sm,
  },
  contentContainer: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionsContainer: {
    width: "100%",
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
    rowGap: SPACING.md,
  },
});
