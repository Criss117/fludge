import {
  ThemedNativeText,
  ThemedText,
} from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  Button,
  Column,
  ElevatedCard,
  Host,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  paddingAll,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRegisterOrganizationForm } from "@fludge/client/iam/forms/organization.form";
import { useRegisterOrganization } from "@fludge/client/iam/mutations/use-organization.mutations";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { OrganizationFormInputs } from "@/core/iam/components/organization-form-inputs";
import { Icon } from "@/core/shared/components/icon";
import { useState } from "react";
import { FieldError } from "@/core/shared/components/field-error";
import Animated from "react-native-reanimated";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";

export function RegisterOrganizationScreen() {
  const spacer = useKeyboardSpacer();
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { hasOrganizations } = useOrganization();
  const registerOrganization = useRegisterOrganization();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useRegisterOrganizationForm({
    onSubmit: ({ value, resetForm }) => {
      setRootError(null);
      registerOrganization.mutate(value, {
        onSuccess: () => {
          resetForm();
        },
        onError: (error) => {
          setRootError(error.message);
        },
      });
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <View style={styles.contentContainer}>
          {rootError && <FieldError>{rootError}</FieldError>}
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
                    {t("forms.organization.commercial_data")}
                  </ThemedNativeText>
                  <form.Field name="name">
                    {(field) => (
                      <OrganizationFormInputs.NameInput field={field} />
                    )}
                  </form.Field>

                  <form.Field name="legalName">
                    {(field) => (
                      <OrganizationFormInputs.LegalNameInput field={field} />
                    )}
                  </form.Field>

                  <form.Field name="taxId">
                    {(field) => (
                      <OrganizationFormInputs.TaxIdInput field={field} />
                    )}
                  </form.Field>
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
                    {t("forms.organization.location_and_contact")}
                  </ThemedNativeText>
                  <form.Field name="phone">
                    {(field) => (
                      <OrganizationFormInputs.PhoneInput field={field} />
                    )}
                  </form.Field>

                  <form.Field name="address">
                    {(field) => (
                      <OrganizationFormInputs.AddressInput field={field} />
                    )}
                  </form.Field>
                </Column>
              </ElevatedCard>
            </Column>
          </Host>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            onClick={form.handleSubmit}
            enabled={!registerOrganization.isPending}
            modifiers={[fillMaxWidth()]}
            colors={{
              containerColor: colors.onPrimaryContainer,
            }}
          >
            <Icon name="add-business" color={colors.primaryContainer} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.primaryContainer}>
              {t("forms.organization.submit")}
            </ThemedNativeText>
          </Button>
        </Host>
        {hasOrganizations && (
          <Link href={{ pathname: "/dashboard/organization" }} asChild replace>
            <ThemedText variant="muted">
              {t("screens.organization.register.to_select")}
            </ThemedText>
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
