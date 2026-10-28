import { useCreateCustomerPaymentForm } from "@fludge/client/commerce/forms/customer-payment.form";
import { useCreateCustomerPaymentMutation } from "@fludge/client/commerce/mutations/use-customer.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useState } from "react";
import { Keyboard } from "react-native";

import { useMutationToast } from "@/integrations/toast";

import type { CustomerPaymentSheetProps } from "./types";

export function useCustomerPaymentSheet({ customer }: CustomerPaymentSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mutationToast = useMutationToast();
  const mutation = useCreateCustomerPaymentMutation();
  const isDisabled = customer.balance === 0;

  const open = () => {
    if (isDisabled) return;
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const closeSheet = () => {
    Keyboard.dismiss();
    close();
  };

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
            resetForm();
            await closeSheet();
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

  return {
    state: {
      isOpen,
      form,
      isDisabled,
    },
    actions: {
      open,
      close,
      closeSheet,
      submit: form.handleSubmit,
    },
  };
}
