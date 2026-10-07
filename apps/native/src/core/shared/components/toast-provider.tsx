import {
  Host,
  Snackbar,
  SnackbarHost,
  type SnackbarHostRef,
  SnackbarDuration,
} from "@expo/ui/jetpack-compose";
import { createContext, use, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "../hooks/use-theme-color";
import type { TranslationKey } from "@fludge/i18n/index";
import { useTranslation } from "react-i18next";

type SnackbarShowOptions = {
  message: TranslationKey;
  actionLabel?: TranslationKey;
  duration?: SnackbarDuration;
};

interface Context {
  show: (options: SnackbarShowOptions) => void;
}

const ToastContext = createContext<Context | null>(null);

export function useToast() {
  const context = use(ToastContext);

  if (!context) throw new Error("useToast must be used within a ToastProvider");

  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { top } = useSafeAreaInsets();
  const hostRef = useRef<SnackbarHostRef>(null);
  const { t } = useTranslation();

  const colors = useThemeColor();

  const show = (options: SnackbarShowOptions) => {
    hostRef.current?.showSnackbar({
      message: t(options.message),
      actionLabel: options.actionLabel,
      withDismissAction: true,
      duration: options.duration,
    });
  };

  return (
    <ToastContext.Provider
      value={{
        show,
      }}
    >
      {children}
      <Host
        matchContents={{ vertical: true }}
        style={{ width: "100%", position: "absolute", top: top }}
      >
        <SnackbarHost ref={hostRef}>
          <Snackbar
            containerColor={colors.primary}
            contentColor={colors.onPrimary}
            actionContentColor={colors.onPrimary}
            dismissActionContentColor={colors.onPrimary}
          />
        </SnackbarHost>
      </Host>
    </ToastContext.Provider>
  );
}
