import { useSignUpForm } from "@fludge/client/iam/forms/sign-in-form";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import type { TranslationKey } from "@fludge/i18n/index";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useMutationToast } from "@/integrations/toast";

export function useSignUpScreen() {
  const { t } = useTranslation();
  const { signUpEmail } = useAppState();
  const [rootError, setRootError] = useState<string | null>(null);
  const mutationToast = useMutationToast();

  const form = useSignUpForm({
    onSubmit: ({ value, resetForm }) => {
      setRootError(null);
      mutationToast.showPending("forms.auth.sign_up_toast.pending");
      signUpEmail.mutate(value, {
        onSuccess: () => {
          resetForm();
          mutationToast.showSuccess("forms.auth.sign_up_toast.success");
        },
        onError: (error) => {
          setRootError(error.message);
          mutationToast.showError(
            "forms.auth.sign_up_toast.error",
            error.message as TranslationKey,
          );
        },
      });
    },
  });

  return {
    texts: {
      title: t("app.title"),
      description: t("screens.sign_up.description"),
      submit: t("forms.auth.sign_up"),
      alreadyAccount: t("screens.sign_up.already_account"),
      signIn: t("screens.sign_up.sign_in"),
    },
    state: {
      rootError,
      form,
    },
    actions: {
      onSubmit: form.handleSubmit,
    },
  };
}
