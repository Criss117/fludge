import type { TranslationKey } from "@fludge/i18n/index";
import { useToast } from "heroui-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useMutationToast(toastId: string) {
  const { toast } = useToast();
  const { t } = useTranslation();

  function showIsPendingToast(label: TranslationKey) {
    toast.show({
      id: toastId,
      isSwipeable: true,
      label: t(label),
      description: t("helpers.please_wait"),
    });
  }

  function showSuccessToast(
    label: TranslationKey,
    description?: TranslationKey
  ) {
    toast.show({
      id: toastId,
      isSwipeable: true,
      variant: "success",
      label: t(label),
      description: description ? t(description) : undefined,
      actionLabel: t("helpers.close"),
      onActionPress: ({ hide }) => hide(),
    });
  }

  function showErrorToast(label: TranslationKey, description: TranslationKey) {
    toast.show({
      id: toastId,
      isSwipeable: true,
      variant: "danger",
      label: t(label),
      description: t(description),
      actionLabel: t("helpers.close"),
      onActionPress: ({ hide }) => hide(),
    });
  }

  useEffect(() => {
    return () => {
      toast.hide(toastId);
    };
  }, []);

  return {
    showIsPendingToast,
    showSuccessToast,
    showErrorToast,
  };
}
