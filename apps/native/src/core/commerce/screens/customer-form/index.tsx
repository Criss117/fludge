import { Button, Host, Spacer } from "@expo/ui/jetpack-compose";
import { width } from "@expo/ui/jetpack-compose/modifiers";
import type { CustomerDetail } from "@fludge/client/commerce/domain/entities";
import { customerFormOptions } from "@fludge/client/commerce/forms/customer.form";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "@fludge/client/commerce/mutations/use-customer.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";
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
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

type Action = { type: "create" } | { type: "update"; customer: CustomerDetail };

interface Props {
  action: Action;
}

function getDefaultValues(action: Action) {
  if (action.type === "create") return undefined;

  return {
    name: action.customer.name,
    phone: action.customer.phone,
    email: action.customer.email ?? "",
    creditLimit: action.customer.creditLimit,
    documentType: action.customer.documentType,
    documentNumber: action.customer.documentNumber,
  };
}

export function CustomerFormScreen({ action }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const router = useRouter();
  const mutationToast = useMutationToast();
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();

  const mode = action.type;

  const form = useForm(
    customerFormOptions(
      {
        onSubmit: ({ value }) => {
          if (mode === "create") {
            mutationToast.showPending("mutations.customers.create.is_pending");

            createMutation.mutate(value, {
              onSuccess: () => {
                router.back();
                mutationToast.showSuccess("mutations.customers.create.success.title");
              },
              onError: (error) => {
                mutationToast.showError(
                  "mutations.customers.create.error",
                  error.message as TranslationKey,
                );
              },
            });

            return;
          }

          mutationToast.showPending("mutations.customers.update.is_pending");

          updateMutation.mutate(
            {
              id: action.customer.id,
              ...value,
            },
            {
              onSuccess: () => {
                router.back();
                mutationToast.showSuccess("mutations.customers.update.success.title");
              },
              onError: (error) => {
                mutationToast.showError(
                  "mutations.customers.update.error",
                  error.message as TranslationKey,
                );
              },
            },
          );
        },
      },
      getDefaultValues(action),
    ),
  );

  const submitKey =
    mode === "create" ? "forms.customer.create.submit" : "forms.customer.update.submit";
  const iconName = mode === "create" ? "person-add" : "edit";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Host matchContents={{ vertical: true }} style={styles.sectionsContainer}>
          <GeneralInformationSection form={form} />
        </Host>
        <Host matchContents={{ vertical: true }} style={styles.sectionsContainer}>
          <ContactSection form={form} />
        </Host>
        <Host matchContents={{ vertical: true }} style={styles.sectionsContainer}>
          <CreditSection form={form} />
        </Host>
      </ScrollView>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            onClick={form.handleSubmit}
          >
            <Icon name={iconName} size={SPACING.lg} color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>{t(submitKey)}</ThemedNativeText>
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
