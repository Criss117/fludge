import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import { Button, Column, Host, ModalBottomSheet, Row, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll, weight, width } from "@expo/ui/jetpack-compose/modifiers";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { useCreateCustomerPaymentForm } from "@fludge/client/commerce/forms/customer-payment.form";
import { useCreateCustomerPaymentMutation } from "@fludge/client/commerce/mutations/use-customer.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard } from "react-native";

import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

interface Props {
  customer: CustomerSummary;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerPaymentSheet({ customer, isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const mutationToast = useMutationToast();
  const mutation = useCreateCustomerPaymentMutation();
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const form = useCreateCustomerPaymentForm({
    onSubmit: ({ value, resetForm }) => {
      mutationToast.showPending("mutations.customer_payment.create.is_pending");

      mutation.mutate(
        {
          customerId: customer.id,
          amount: value.amount,
          method: "cash",
          notes: "",
        },
        {
          onSuccess: async () => {
            mutationToast.showSuccess("mutations.customer_payment.create.success.title");
            Keyboard.dismiss();
            await sheetRef.current?.hide();
            onClose();
            resetForm();
          },
          onError: (error) => {
            mutationToast.showError(
              "mutations.customer_payment.create.error",
              error.message as TranslationKey,
            );
          },
        },
      );
    },
  });

  const closeSheet = async () => {
    Keyboard.dismiss();
    await sheetRef.current?.hide();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Host matchContents>
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={onClose}
        skipPartiallyExpanded
        containerColor={colors.background}
        contentColor={colors.onBackground}
      >
        <Column
          verticalArrangement={{ spacedBy: SPACING.md }}
          modifiers={[paddingAll(SPACING.md), fillMaxWidth()]}
        >
          <ThemedNativeText variant="h5">{t("forms.customer_payment.title")}</ThemedNativeText>

          <form.Field name="amount">
            {(field) => (
              <TextInput
                type="number"
                label="forms.customer_payment.amount.label"
                placeholder="forms.customer_payment.amount.placeholder"
                iconName="dollar"
                modifiers={[fillMaxWidth()]}
                isError={field.state.meta.isTouched && !field.state.meta.isValid}
                onValueChange={field.handleChange}
                errors={field.state.meta.errors}
                keyboardOptions={{
                  keyboardType: "number",
                }}
              />
            )}
          </form.Field>

          <Spacer modifiers={[width(SPACING.sm)]} />

          <Row horizontalArrangement={{ spacedBy: SPACING.sm }}>
            <Button
              modifiers={[weight(1)]}
              colors={{
                containerColor: colors.surface,
                contentColor: colors.onSurface,
              }}
              onClick={closeSheet}
            >
              <ThemedNativeText color={colors.onSurface}>{t("helpers.cancel")}</ThemedNativeText>
            </Button>
            <Button
              modifiers={[weight(1)]}
              colors={{
                containerColor: colors.primary,
                contentColor: colors.onPrimary,
              }}
              onClick={form.handleSubmit}
            >
              <ThemedNativeText color={colors.onPrimary}>
                {t("forms.customer_payment.submit")}
              </ThemedNativeText>
            </Button>
          </Row>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
