import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
import {
  Button,
  Column,
  Host,
  ModalBottomSheet,
  OutlinedButton,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll, weight, width } from "@expo/ui/jetpack-compose/modifiers";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { CustomerPaymentSheetProps } from "./types";
import { useCustomerPaymentSheet } from "./use-customer-payment-sheet";

export function CustomerPaymentSheet({ customer }: CustomerPaymentSheetProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const { state, actions } = useCustomerPaymentSheet({ customer });

  const onClose = async () => {
    await sheetRef.current?.hide();
    actions.close();
  };

  return (
    <Host matchContents>
      <OutlinedButton
        onClick={actions.open}
        colors={{
          containerColor: colors.onPrimary,
        }}
        enabled={!state.isDisabled}
      >
        <Icon name="dollar" size={18} color={state.isDisabled ? colors.outline : colors.primary} />
        <ThemedNativeText variant="sm" color={state.isDisabled ? colors.outline : colors.primary}>
          {t("screens.customers.card.pay")}
        </ThemedNativeText>
      </OutlinedButton>

      {state.isOpen && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={actions.close}
          skipPartiallyExpanded
          containerColor={colors.background}
          contentColor={colors.onBackground}
        >
          <Column
            verticalArrangement={{ spacedBy: SPACING.md }}
            modifiers={[paddingAll(SPACING.md), fillMaxWidth()]}
          >
            <ThemedNativeText variant="h5">{t("forms.customer_payment.title")}</ThemedNativeText>

            <state.form.Field name="amount">
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
            </state.form.Field>

            <Spacer modifiers={[width(SPACING.sm)]} />

            <Row horizontalArrangement={{ spacedBy: SPACING.sm }}>
              <OutlinedButton
                modifiers={[weight(1)]}
                colors={{
                  containerColor: colors.surface,
                  contentColor: colors.onSurface,
                }}
                onClick={onClose}
              >
                <ThemedNativeText color={colors.onSurface}>{t("helpers.cancel")}</ThemedNativeText>
              </OutlinedButton>
              <Button
                modifiers={[weight(1)]}
                colors={{
                  containerColor: colors.primary,
                  contentColor: colors.onPrimary,
                }}
                onClick={actions.submit}
              >
                <ThemedNativeText color={colors.onPrimary}>
                  {t("forms.customer_payment.submit")}
                </ThemedNativeText>
              </Button>
            </Row>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
