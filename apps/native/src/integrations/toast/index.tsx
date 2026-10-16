import type { TranslationKey } from "@fludge/i18n/index";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "sonner-native";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

import { GeistFonts } from "../fonts";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const colors = useThemeColor();

  return (
    <>
      {children}
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: colors.primary,
          },
          titleStyle: {
            color: colors.onPrimary,
            fontFamily: GeistFonts.Regular,
          },
          actionButtonStyle: {
            backgroundColor: colors.onPrimary,
          },
          actionButtonTextStyle: {
            fontFamily: GeistFonts.Regular,
          },
          cancelButtonTextStyle: {
            fontFamily: GeistFonts.Regular,
            color: colors.onPrimary,
          },
          closeButtonIconStyle: {
            color: colors.onPrimary,
          } as any,
        }}
      />
    </>
  );
}

export function useMutationToast(toastId?: string) {
  const { t } = useTranslation();

  const id = toastId ?? new Date().getTime().toString();

  const showPending = (message: TranslationKey) => {
    toast.loading(t(message), {
      id,
    });
  };

  const showSuccess = (message: TranslationKey) => {
    toast.success(t(message), {
      id,
      closeButton: true,
    });
  };

  const showError = (message: TranslationKey, description?: TranslationKey) => {
    toast.error(t(message), {
      id,
      closeButton: true,
      description: description ? t(description) : undefined,
    });
  };

  return {
    showPending,
    showSuccess,
    showError,
  };
}
