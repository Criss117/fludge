import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useRegisterOrganizationForm } from "@fludge/client/iam/forms/organization.form";
import { useRegisterOrganization } from "@fludge/client/iam/mutations/use-organization.mutations";
import { useFindOrganizations } from "@fludge/client/iam/queries/use-find-organizations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useState } from "react";

import { useMutationToast } from "@/integrations/toast";

export function useRegisterOrganizationScreen() {
  const { data: organizations } = useFindOrganizations();
  const registerOrganization = useRegisterOrganization();
  const mutationToast = useMutationToast();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useRegisterOrganizationForm({
    onSubmit: ({ value, resetForm }) => {
      setRootError(null);
      mutationToast.showPending("forms.organization.register_toast.pending");
      registerOrganization.mutate(value, {
        onSuccess: () => {
          resetForm();
          mutationToast.showSuccess("forms.organization.register_toast.success");
        },
        onError: (error) => {
          setRootError(error.message);
          mutationToast.showError(
            "forms.organization.register_toast.error",
            error.message as TranslationKey,
          );
        },
      });
    },
  });

  return {
    texts: {
      sections: {
        commercialData: getI18nKey("forms.organization.commercial_data"),
        locationAndContact: getI18nKey("forms.organization.location_and_contact"),
      },
      submit: getI18nKey("forms.organization.submit"),
      backToSelect: getI18nKey("screens.organization.register.to_select"),
    },
    state: {
      form,
      rootError,
      isPending: registerOrganization.isPending,
      hasOrganizations: organizations.length > 0,
    },
    actions: {
      submit: form.handleSubmit,
    },
  };
}
