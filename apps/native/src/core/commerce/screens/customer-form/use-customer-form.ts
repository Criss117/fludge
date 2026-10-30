import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import type { CustomerFormSchema } from "@fludge/client/commerce/forms/customer.form";
import { customerFormOptions } from "@fludge/client/commerce/forms/customer.form";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "@fludge/client/commerce/mutations/use-customer.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";

import { useMutationToast } from "@/integrations/toast";

import type { CustomerFormScreenProps } from "./types";

type Action = CustomerFormScreenProps["action"];

function getDefaultValues(action: Action): CustomerFormSchema | undefined {
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

export function useCustomerFormScreen({ action }: CustomerFormScreenProps) {
  const router = useRouter();
  const mutationToast = useMutationToast();
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();

  const form = useForm(
    customerFormOptions(
      {
        onSubmit: ({ value }) => {
          if (action.type === "create") {
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

  return {
    state: {
      form,
    },
    actions: {
      submit: form.handleSubmit,
    },
    texts: {
      submit: getI18nKey(
        action.type === "create" ? "forms.customer.create.submit" : "forms.customer.update.submit",
      ),
      iconName: action.type === "create" ? ("person-add" as const) : ("edit" as const),
    },
  };
}
