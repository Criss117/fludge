import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { TICKETS_LOCAL_STORAGE_KEY } from "@/modules/shared/utils/constanst";
import {
  type SyncStore,
  TicketsProvider,
} from "@fludge/client/providers/tickets.provider";

const asyncStorageSyncStore: SyncStore = {
  async save(state) {
    try {
      const serialized = JSON.stringify(state);
      await AsyncStorage.setItem(TICKETS_LOCAL_STORAGE_KEY, serialized);
    } catch (error) {
      throw new Error(`No se pudo guardar en AsyncStorage: ${error}`);
    }
  },

  async load() {
    const raw = await AsyncStorage.getItem(TICKETS_LOCAL_STORAGE_KEY);

    if (!raw) {
      throw new Error("No hay datos guardados");
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(`Datos corruptos en AsyncStorage: ${error}`);
    }
  },
};

export default function SaleLayout() {
  const [background, foreground] = useThemeColor(["background", "foreground"]);

  return (
    <TicketsProvider syncStore={asyncStorageSyncStore}>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: background,
          },
          headerStyle: {
            backgroundColor: background,
          },
          headerTitleStyle: {
            color: foreground,
            fontFamily: GeistFonts.SemiBold,
          },
          animation: "slide_from_right",
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </TicketsProvider>
  );
}
