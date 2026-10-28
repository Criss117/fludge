import { BottomSheet, Button, Host, HStack, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  frame,
  padding,
  presentationBackground,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { CustomerPaymentSheetProps } from "./types";
import { useCustomerPaymentSheet } from "./use-customer-payment-sheet";

export function CustomerPaymentSheet({ customer }: CustomerPaymentSheetProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { state, actions } = useCustomerPaymentSheet({ customer });

  return (
    <Host matchContents>
      <VStack>
        <BottomSheet
          isPresented={state.isOpen}
          onIsPresentedChange={(v) => {
            if (!v) actions.close();
          }}
          anchor={
            <Button
              onPress={actions.open}
              modifiers={[
                buttonStyle(state.isDisabled ? "bordered" : "borderedProminent"),
                tint(colors.primary),
              ]}
            >
              <HStack spacing={SPACING.sm} modifiers={[frame({ maxWidth: Infinity })]}>
                <Icon
                  name="dollar"
                  size={14}
                  color={state.isDisabled ? colors.outline : colors.primary}
                />
                <ThemedNativeText color={state.isDisabled ? colors.outline : colors.primary}>
                  {t("screens.customers.card.pay")}
                </ThemedNativeText>
              </HStack>
            </Button>
          }
          fitToContents
        >
          <VStack
            modifiers={[
              padding({
                horizontal: SPACING.md,
                top: SPACING["2xl"],
                bottom: SPACING["2xl"],
              }),
              presentationBackground(colors.background),
            ]}
            spacing={SPACING["xl"]}
          >
            <ThemedNativeText variant="h5" color={colors.primary}>
              {t("forms.customer_payment.title")}
            </ThemedNativeText>

            <state.form.Field name="amount">
              {(field) => (
                <TextInput
                  type="number"
                  label="forms.customer_payment.amount.label"
                  placeholder="forms.customer_payment.amount.placeholder"
                  iconName="dollar"
                  modifiers={[frame({ maxWidth: Infinity })]}
                  isError={field.state.meta.isTouched && !field.state.meta.isValid}
                  onValueChange={field.handleChange}
                  errors={field.state.meta.errors}
                  keyboardOptions={{
                    keyboardType: "number",
                  }}
                />
              )}
            </state.form.Field>

            <HStack spacing={SPACING.sm}>
              <Button
                modifiers={[buttonStyle("bordered"), controlSize("large")]}
                onPress={actions.closeSheet}
              >
                <ThemedNativeText modifiers={[frame({ maxWidth: Infinity })]}>
                  {t("helpers.cancel")}
                </ThemedNativeText>
              </Button>
              <Button
                modifiers={[
                  buttonStyle("borderedProminent"),

                  controlSize("large"),
                  tint(colors.primary),
                ]}
                onPress={actions.submit}
              >
                <ThemedNativeText
                  color={colors.onPrimary}
                  modifiers={[frame({ maxWidth: Infinity })]}
                >
                  {t("forms.customer_payment.submit")}
                </ThemedNativeText>
              </Button>
            </HStack>
          </VStack>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
