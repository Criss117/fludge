import { useAppState } from "@fludge/client/iam/hooks/use-app-state";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import { ago } from "@fludge/client/shared/date";
import type { TranslationKey } from "@fludge/i18n/index";
import { getI18nKey } from "@fludge/utils/validators/shared";

import { useMutationToast } from "@/integrations/toast";

import type { SyncItemProps } from "./types";

export function usePreferencesSection() {
  const { setTheme, data } = useAppState();

  const toggleTheme = () => {
    setTheme.mutate({
      theme: data.theme === "light" ? "dark" : "light",
    });
  };

  return {
    texts: {
      title: getI18nKey("screens.settings.sections.preferences.title"),
      dark_mode: {
        label: getI18nKey("screens.settings.sections.preferences.dark_mode.label"),
        placeholder: getI18nKey("screens.settings.sections.preferences.dark_mode.placeholder"),
      },
    },
    actions: {
      toggleTheme,
    },
    state: {
      isDarkMode: data.theme === "dark",
    },
  };
}

export function useSessionSection() {
  const { signOut, switchActiveOrganization } = useAppState();
  const { isFullyOnline } = useNetwork();
  const mutationToast = useMutationToast();

  const setNullActiveOrganization = () => {
    switchActiveOrganization.mutate({ activeOrganizationId: null });
  };

  const onSignOut = () => {
    signOut.mutate(undefined, {
      onError: (e) => {
        mutationToast.showError(e.message as TranslationKey);
      },
    });
  };

  const isPending = switchActiveOrganization.isPending || signOut.isPending;

  return {
    texts: {
      title: getI18nKey("screens.settings.sections.session.title"),
      switch_organization: getI18nKey("screens.settings.sections.session.switch_organization"),
      sign_out: getI18nKey("screens.settings.sections.session.sign_out"),
    },
    actions: {
      setNullActiveOrganization,
      onSignOut,
    },
    state: {
      isPending,
      isFullyOnline,
    },
  };
}

export function useSyncSectionItem(props: SyncItemProps) {
  const { isFullyOnline } = useNetwork();
  const mutationToast = useMutationToast(`sync-toast-${props.module}`);

  const isDisabled = props.syncHook.isRefetching || !isFullyOnline;

  const translationBaseKey = `screens.settings.sections.sync.${props.module}` as const;

  function sync() {
    if (!isFullyOnline) {
      mutationToast.showError(
        `${translationBaseKey}.on_error.title` as TranslationKey,
        "helpers.no_conection",
      );
      return;
    }

    if (props.syncHook.isRefetching) return;

    mutationToast.showPending(`${translationBaseKey}.refetching` as TranslationKey);
    props.syncHook
      .refetch()
      .then(() => {
        mutationToast.showSuccess(`${translationBaseKey}.on_success` as TranslationKey);
      })
      .catch(() => {
        mutationToast.showError(
          `${translationBaseKey}.on_error.title` as TranslationKey,
          `${translationBaseKey}.on_error.description` as TranslationKey,
        );
      });
  }

  return {
    texts: {
      title: getI18nKey(`${translationBaseKey}.title` as TranslationKey),
      last_synced_at: {
        label: getI18nKey(`${translationBaseKey}.last_synced_at` as TranslationKey),
        date: props.syncHook.data.syncedAt ? ago(props.syncHook.data.syncedAt) : null,
      },
    },
    actions: {
      sync,
    },
    state: {
      isDisabled,
    },
  };
}
