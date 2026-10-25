import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useGroupForm } from "@fludge/client/iam/forms/group.form";
import { useCreateGroup } from "@fludge/client/iam/mutations/use-group.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";

import { useMutationToast } from "@/integrations/toast";

export function useCreateGroupScreen() {
  const mutation = useCreateGroup();
  const mutationToast = useMutationToast();

  const router = useRouter();

  const form = useGroupForm({
    onSubmit: ({ value }) => {
      mutationToast.showPending("forms.group.create.pending");
      mutation.mutate(
        {
          name: value.name,
          description: value.description,
          permissions: value.permissions,
        },
        {
          onSuccess: () => {
            router.back();
            mutationToast.showSuccess("forms.group.create.success");
          },
          onError: (e) => {
            mutationToast.showError("forms.group.create.error", e.message as TranslationKey);
          },
        },
      );
    },
  });

  return {
    texts: {
      submit: getI18nKey("forms.group.create.submit"),
      sections: {
        details: getI18nKey("forms.group.details.title"),
        permissions: getI18nKey("forms.group.permissions.label"),
      },
    },
    actions: {
      submit: form.handleSubmit,
    },
    state: {
      form,
    },
  };
}
