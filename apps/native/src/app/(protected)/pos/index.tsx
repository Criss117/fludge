import { Button, Host } from "@expo/ui";
import { FiltersProvider } from "@fludge/client/providers/filters.provider";
import { Platform } from "expo";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { POSScreen } from "@/core/commerce/screens/pos";
import { ThemedNativeText } from "@/core/shared/components/themed-text";

const isAndroid = Platform.OS === "android";

function StackConfig() {
  const router = useRouter();
  const { t } = useTranslation();

  const charge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/pos/charge");
  };

  return (
    <>
      {isAndroid ? (
        <Stack.Screen
          options={{
            headerRight: () => (
              <Host matchContents>
                <Button variant="outlined" onPress={charge}>
                  <ThemedNativeText>{t("screens.pos.ticket_summary.charge")}</ThemedNativeText>
                </Button>
              </Host>
            ),
          }}
        />
      ) : (
        <>
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button icon="chevron.backward" onPress={router.back} />
          </Stack.Toolbar>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button onPress={charge}>
              <Stack.Toolbar.Label>{t("screens.pos.ticket_summary.charge")}</Stack.Toolbar.Label>
            </Stack.Toolbar.Button>
          </Stack.Toolbar>
        </>
      )}
    </>
  );
}

export default function POS() {
  return (
    <FiltersProvider
      initialState={{
        status: "active",
        orderBy: [
          {
            direction: "desc",
            field: "createdAt",
          },
        ],
      }}
    >
      <StackConfig />
      <POSScreen />
    </FiltersProvider>
  );
}
