import { FiltersProvider } from "@fludge/client/providers/filters.provider";
import { Platform } from "expo";
import { Stack, useRouter } from "expo-router";

import { POSScreen } from "@/core/commerce/screens/pos";

const isAndroid = Platform.OS === "android";

function StackConfig() {
  const router = useRouter();

  if (isAndroid) return null;

  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.backward" onPress={() => router.back()} />
      </Stack.Toolbar>
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
