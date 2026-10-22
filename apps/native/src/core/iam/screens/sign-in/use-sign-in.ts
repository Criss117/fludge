import { useSignInForm } from "@fludge/client/iam/forms/sign-in-form";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useInvalidateSync } from "@fludge/client/sync/use-invalidate-sync";
import type { TranslationKey } from "@fludge/i18n/index";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useMutationToast } from "@/integrations/toast";

export function useSignInScreen() {
  const { t } = useTranslation();
  const [rootError, setRootError] = useState<string | null>(null);
  const { invalidateSync } = useInvalidateSync();
  const { signInEmail } = useAppState();
  const mutationToast = useMutationToast();

  const form = useSignInForm({
    onSubmit: ({ value, resetForm }) => {
      setRootError(null);
      mutationToast.showPending("forms.auth.sign_in_toast.pending");
      signInEmail.mutate(value, {
        onSuccess: () => {
          resetForm();
          invalidateSync();
          mutationToast.showSuccess("forms.auth.sign_in_toast.success");
        },
        onError: (error) => {
          setRootError(error.message);
          mutationToast.showError(
            "forms.auth.sign_in_toast.error",
            error.message as TranslationKey,
          );
        },
      });
    },
  });

  return {
    texts: {
      title: t("app.title"),
      description: t("screens.sign_in.description"),
      submit: t("forms.auth.sign_in"),
      noAccount: t("screens.sign_in.no_account"),
      signUp: t("screens.sign_in.sign_up"),
    },
    actions: {
      onSubmit: form.handleSubmit,
    },
    state: {
      rootError,
      form,
    },
  };
}
