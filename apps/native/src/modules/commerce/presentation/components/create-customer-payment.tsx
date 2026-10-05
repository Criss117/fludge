import { CommonInputs } from "@/modules/shared/components/common-inputs";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { useCreateCustomerPaymentForm } from "@fludge/client/commerce/forms/customer-payment.form";
import { useCreateCustomerPaymentMutation } from "@fludge/client/commerce/mutations/use-customer.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { useBottomSheetAwareHandlers } from "heroui-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardController } from "react-native-keyboard-controller";

const SNAP_POINTS = ["60%", "90%"];

function SheetContent({
  form,
}: {
  form: ReturnType<typeof useCreateCustomerPaymentForm>;
}) {
  const { t } = useTranslation();
  const { onFocus } = useBottomSheetAwareHandlers();

  return (
    <View>
      <BottomSheet.Title>{t("forms.customer_payment.title")}</BottomSheet.Title>
      <Separator />

      <View className="gap-y-4 py-4">
        <form.Field name="amount">
          {(field) => (
            <CommonInputs.NumberInput
              isRequired
              isInvalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
              label="forms.customer_payment.amount.label"
              icon="attach-money"
              inputProps={{
                id: "create-customer-payment-amount",
                onBlur: field.handleBlur,
                onChangeText: field.handleChange,
                onFocus,
                value: field.state.value,
                placeholder: "helpers.placeholder.zero",
                className: "bg-default",
                keyboardType: "numeric",
              }}
            />
          )}
        </form.Field>

        <form.Field name="method">
          {(field) => (
            <View>
              <Typography.Paragraph color="muted">
                {t("forms.customer_payment.method.label")}
              </Typography.Paragraph>
              <View className="flex-row gap-x-2">
                <Button
                  className="flex-1"
                  variant={field.state.value === "cash" ? "primary" : "outline"}
                  onPress={() => field.handleChange("cash")}
                >
                  <MaterialIcons
                    name="payments"
                    size={20}
                    className="text-eclipse"
                  />
                  <Button.Label className="text-eclipse">
                    {t("forms.customer_payment.method.cash")}
                  </Button.Label>
                </Button>
                <Button
                  className="flex-1"
                  variant={
                    field.state.value === "transfer" ? "primary" : "outline"
                  }
                  onPress={() => field.handleChange("transfer")}
                >
                  <MaterialIcons
                    name="credit-card"
                    size={20}
                    className="text-eclipse"
                  />
                  <Button.Label className="text-eclipse">
                    {t("forms.customer_payment.method.transfer")}
                  </Button.Label>
                </Button>
              </View>
            </View>
          )}
        </form.Field>

        <form.Field name="notes">
          {(field) => (
            <CommonInputs.TextAreaInput
              isInvalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
              label="forms.customer_payment.notes.label"
              inputProps={{
                id: "create-customer-payment-notes",
                onBlur: field.handleBlur,
                onChangeText: field.handleChange,
                onFocus,
                value: field.state.value,
                className: "bg-default",
                placeholder: "forms.customer_payment.notes.placeholder",
              }}
            />
          )}
        </form.Field>
      </View>
    </View>
  );
}

interface SheetFormProps extends BottomSheetFooterProps {
  onSubmit: () => void;
  isPending: boolean;
}

function SheetFooter({ onSubmit, isPending, ...props }: SheetFormProps) {
  const { t } = useTranslation();

  return (
    <BottomSheetFooter {...props}>
      <View className="pb-safe-offset-8 bg-overlay px-4 pt-2">
        <Separator className="-mx-4 mb-4" />

        <Button className="flex-1" isDisabled={isPending} onPress={onSubmit}>
          <MaterialIcons
            name="check-circle"
            size={20}
            className="text-eclipse"
          />
          <Button.Label className="text-eclipse">
            {t("helpers.continue")}
          </Button.Label>
        </Button>
      </View>
    </BottomSheetFooter>
  );
}

interface Props {
  customer: CustomerSummary;
}

export function CreateCustomerPayment({ customer }: Props) {
  const [open, isOpen] = useState(false);
  const { t } = useTranslation();
  const createCustomerPayment = useCreateCustomerPaymentMutation();
  const mutationToast = useMutationToast("customer-payment-toast");

  const form = useCreateCustomerPaymentForm({
    onSubmit: ({ value, resetForm }) => {
      mutationToast.showIsPendingToast(
        "mutations.customer_payment.create.is_pending"
      );
      createCustomerPayment.mutate(
        {
          customerId: customer.id,
          amount: value.amount,
          method: value.method,
          notes: value.notes,
        },
        {
          onSuccess: () => {
            resetForm();
            isOpen(false);
            mutationToast.showSuccessToast(
              "mutations.customer_payment.create.success.title",
              "mutations.customer_payment.create.success.description"
            );
          },
          onError: (error) => {
            mutationToast.showErrorToast(
              "mutations.customer_payment.create.error",
              error.message as TranslationKey
            );
          },
        }
      );
    },
  });

  const Footer = useCallback(
    (props: BottomSheetFooterProps) => (
      <SheetFooter
        {...props}
        isPending={createCustomerPayment.isPending}
        onSubmit={form.handleSubmit}
      />
    ),
    [form, createCustomerPayment.isPending]
  );

  return (
    <BottomSheet isOpen={open} onOpenChange={isOpen}>
      <BottomSheet.Trigger asChild>
        <Button size="sm" className="w-full">
          <MaterialIcons name="payments" size={18} className="text-eclipse" />
          <Button.Label className="text-eclipse">
            {t("forms.customer_payment.title")}
          </Button.Label>
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={SNAP_POINTS}
          enableOverDrag={false}
          enableDynamicSizing={false}
          keyboardBehavior="extend"
          onClose={() => {
            KeyboardController.dismiss();
            form.reset();
          }}
          footerComponent={Footer}
        >
          <SheetContent form={form} />
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
