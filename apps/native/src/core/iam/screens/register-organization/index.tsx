import { Button, Column, ElevatedCard, Host, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding, paddingAll, width } from "@expo/ui/jetpack-compose/modifiers";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { OrganizationFormInputs } from "@/core/iam/components/organization-form-inputs";
import { FieldError } from "@/core/shared/components/field-error";
import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useRegisterOrganizationScreen } from "./use-register-organization-screen";

export function RegisterOrganizationScreen() {
  const spacer = useKeyboardSpacer();
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { actions, state, texts } = useRegisterOrganizationScreen();

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <View style={styles.contentContainer}>
          {state.rootError && <FieldError>{state.rootError}</FieldError>}
          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <Column modifiers={[padding(SPACING.sm, 0, SPACING.sm, 0)]}>
              <ElevatedCard
                modifiers={[fillMaxWidth()]}
                colors={{
                  containerColor: colors.onSecondary,
                }}
              >
                <Column
                  modifiers={[paddingAll(SPACING.md)]}
                  verticalArrangement={{
                    spacedBy: SPACING.md,
                  }}
                >
                  <ThemedNativeText variant="h5">
                    {t(texts.sections.commercialData)}
                  </ThemedNativeText>
                  <state.form.Field name="name">
                    {(field) => <OrganizationFormInputs.NameInput field={field} />}
                  </state.form.Field>

                  <state.form.Field name="legalName">
                    {(field) => <OrganizationFormInputs.LegalNameInput field={field} />}
                  </state.form.Field>

                  <state.form.Field name="taxId">
                    {(field) => <OrganizationFormInputs.TaxIdInput field={field} />}
                  </state.form.Field>
                </Column>
              </ElevatedCard>
            </Column>
          </Host>

          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <Column modifiers={[padding(SPACING.sm, 0, SPACING.sm, 0)]}>
              <ElevatedCard
                modifiers={[fillMaxWidth()]}
                colors={{
                  containerColor: colors.onSecondary,
                }}
              >
                <Column
                  modifiers={[paddingAll(SPACING.md)]}
                  verticalArrangement={{
                    spacedBy: SPACING.md,
                  }}
                >
                  <ThemedNativeText variant="h5">
                    {t(texts.sections.locationAndContact)}
                  </ThemedNativeText>
                  <state.form.Field name="phone">
                    {(field) => <OrganizationFormInputs.PhoneInput field={field} />}
                  </state.form.Field>

                  <state.form.Field name="address">
                    {(field) => <OrganizationFormInputs.AddressInput field={field} />}
                  </state.form.Field>
                </Column>
              </ElevatedCard>
            </Column>
          </Host>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            onClick={actions.submit}
            enabled={!state.isPending}
            modifiers={[fillMaxWidth()]}
            colors={{
              containerColor: colors.onPrimaryContainer,
            }}
          >
            <Icon name="save" color={colors.primaryContainer} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.primaryContainer}>{t(texts.submit)}</ThemedNativeText>
          </Button>
        </Host>
        {state.hasOrganizations && (
          <Link href={{ pathname: "/organization" }} asChild replace>
            <ThemedText variant="muted">{t(texts.backToSelect)}</ThemedText>
          </Link>
        )}
      </View>
      <Animated.View style={spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    rowGap: SPACING.lg,
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
