import { getI18nKey } from "@fludge/api/core/shared/i18n/utils";
import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useFindOrganizations } from "@fludge/client/iam/queries/use-find-organizations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMutationToast } from "@/integrations/toast";

export function useSelectOrganizationScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const {
    data: { session, activeOrganization },
    switchActiveOrganization,
  } = useAppState();
  const { data: organizations } = useFindOrganizations();
  const mutationToast = useMutationToast();

  const userIsRoot = !!session?.user.isRoot;

  const allOrganizations = useMemo(() => {
    if (!query) return organizations;

    return organizations.filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.taxId.toLowerCase().includes(query.toLowerCase()) ||
        d.legalName.toLowerCase().includes(query.toLowerCase()),
    );
  }, [organizations, query]);

  const onChangeText = (text: string) => setQuery(text.trim());

  const onSelect = async (organizationId: string) => {
    if (switchActiveOrganization.isPending) return;

    if (organizationId === activeOrganization?.id) {
      router.replace({
        pathname: "/dashboard",
      });

      return;
    }

    mutationToast.showPending("forms.organization.switch_toast.pending");
    switchActiveOrganization.mutate(
      {
        activeOrganizationId: organizationId,
      },
      {
        onSuccess: () => {
          mutationToast.showSuccess("forms.organization.switch_toast.success");
        },
        onError: (error) => {
          mutationToast.showError(
            "forms.organization.switch_toast.error",
            error.message as TranslationKey,
          );
        },
      },
    );
  };

  return {
    texts: {
      searchInput: {
        placeholder: getI18nKey("screens.organization.select.search.placeholder"),
        label: getI18nKey("screens.organization.select.search.label"),
      },
      emptyList: t("screens.organization.select.no_organizations"),
      toRegister: t("screens.organization.register.title"),
    },
    state: {
      organizations: allOrganizations,
      userIsRoot,
      query,
    },
    actions: {
      onSelect,
      onChangeText,
    },
  };
}
