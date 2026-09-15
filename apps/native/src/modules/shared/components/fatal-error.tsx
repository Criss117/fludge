import type { TranslationKey } from "@fludge/i18n/index";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useCSSVariable } from "uniwind";
import { Text } from "./app-text";
import { MaterialIcons } from "./icons";

type FatalErrorScreenProps = {
  title?: TranslationKey;
  message?: TranslationKey;
  error?: Error;
  onRetry?: () => void;
};

export function FatalErrorScreen({
  title,
  message,
  error,
  onRetry,
}: FatalErrorScreenProps) {
  const { t } = useTranslation();
  const accent = useCSSVariable("accent");
  const danger = useCSSVariable("danger");

  return (
    <View className="bg-background flex-1 items-center justify-center gap-6 px-6">
      <View className="items-center gap-2">
        <Text
          className="text-6xl font-bold"
          style={{ color: danger?.toString() ?? "#ef4444" }}
        >
          <MaterialIcons name="error" size={48} color="text-muted" />
        </Text>

        <Text className="text-accent text-center text-2xl font-bold">
          {t(title ?? "app.errors.fatal.title")}
        </Text>

        <Text className="text-muted text-center text-sm">
          {t(message ?? "app.errors.fatal.message")}
        </Text>

        {__DEV__ && error ? (
          <Text className="text-muted mt-2 text-center text-xs opacity-70">
            {error.message}
          </Text>
        ) : null}
      </View>

      {onRetry ? (
        <Pressable
          onPress={onRetry}
          className="rounded-full px-6 py-3"
          style={{ backgroundColor: accent?.toString() }}
        >
          <Text className="text-background text-base font-semibold">
            {t("app.errors.fatal.retry")}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
