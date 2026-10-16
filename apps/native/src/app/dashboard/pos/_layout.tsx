import {
  TicketStoreProvider,
  useTicketsHydrated,
} from "@fludge/client/providers/ticket-store.provider";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { GeistFonts } from "@/integrations/fonts";

function Screen() {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const hydrated = useTicketsHydrated();

  if (!hydrated) return <BaseLoadingIndicator />;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.onPrimaryContainer,
          fontFamily: GeistFonts.Bold,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("screens.pos.label"),
        }}
      />
    </Stack>
  );
}

export default function POSLayout() {
  return (
    <TicketStoreProvider>
      <Screen />
    </TicketStoreProvider>
  );
}
