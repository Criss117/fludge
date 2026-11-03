import { Button, Host, HStack, VStack } from "@expo/ui/swift-ui";
import { buttonStyle, disabled, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { OrganizationFormInputs } from "@/core/iam/components/organization-form-inputs";
import { NativeFieldError } from "@/core/shared/components/field-error";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { LinkButton } from "@/core/shared/components/link-button";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedScrollView, ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useRegisterOrganizationScreen } from "./use-register-organization-screen";

export function RegisterOrganizationScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { actions, state, texts } = useRegisterOrganizationScreen();

  return (
    <ThemedView style={styles.container}>
      <ThemedScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Host matchContents={{ vertical: true }} style={styles.host} ignoreSafeArea="container">
          <VStack alignment="leading" spacing={SPACING.xl}>
            {state.rootError && <NativeFieldError>{state.rootError}</NativeFieldError>}

            <VStack alignment="leading" spacing={SPACING.md}>
              <ThemedNativeText variant="h5">{t(texts.sections.commercialData)}</ThemedNativeText>

              <state.form.Field name="name">
                {(field) => <OrganizationFormInputs.NameInput field={field} />}
              </state.form.Field>

              <state.form.Field name="legalName">
                {(field) => <OrganizationFormInputs.LegalNameInput field={field} />}
              </state.form.Field>

              <state.form.Field name="taxId">
                {(field) => <OrganizationFormInputs.TaxIdInput field={field} />}
              </state.form.Field>
            </VStack>

            <VStack alignment="leading" spacing={SPACING.md}>
              <ThemedNativeText variant="h5">
                {t(texts.sections.locationAndContact)}
              </ThemedNativeText>

              <state.form.Field name="phone">
                {(field) => <OrganizationFormInputs.PhoneInput field={field} />}
              </state.form.Field>

              <state.form.Field name="address">
                {(field) => <OrganizationFormInputs.AddressInput field={field} />}
              </state.form.Field>
            </VStack>
          </VStack>
        </Host>
      </ThemedScrollView>

      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={styles.host}>
          <Button
            onPress={actions.submit}
            modifiers={[
              buttonStyle("borderedProminent"),
              tint(colors.primary),
              disabled(state.isPending),
              frame({ maxWidth: Infinity }),
            ]}
          >
            <HStack spacing={SPACING.sm} modifiers={[frame({ maxWidth: Infinity })]}>
              <Icon name="check" size={18} color={colors.onPrimary} />
              <ThemedNativeText color={colors.onPrimary} variant="h6">
                {t(texts.submit)}
              </ThemedNativeText>
            </HStack>
          </Button>
        </Host>

        {state.hasOrganizations && (
          <Host matchContents={{ vertical: true }} style={styles.host}>
            <LinkButton action={{ type: "replace", href: "/organization" }}>
              <ThemedNativeText variant="muted">{t(texts.backToSelect)}</ThemedNativeText>
            </LinkButton>
          </Host>
        )}
      </View>

      <KeyboardSpacerView />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  contentContainer: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  host: {
    alignSelf: "stretch",
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
