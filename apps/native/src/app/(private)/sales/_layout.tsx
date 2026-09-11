import { GeistFonts } from "@/integrations/fonts";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import {
  deserializeTicketMap,
  serializeTicketMap,
  SyncStore,
  TicketsProvider,
} from "@fludge/client/providers/tickets.provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initialState } from "@fludge/client/application/sales/store/tickets.store";
import { TICKETS_LOCAL_STORAGE_KEY } from "@/modules/shared/utils/constanst";

export const asyncStorageSync: SyncStore = {
  save: async (tickets) => {
    await AsyncStorage.setItem(
      TICKETS_LOCAL_STORAGE_KEY,
      serializeTicketMap(tickets)
    );
  },
  load: async () => {
    const raw = await AsyncStorage.getItem(TICKETS_LOCAL_STORAGE_KEY);
    return raw ? deserializeTicketMap(raw) : initialState;
  },
};
export default function SaleLayout() {
  const [background, foreground] = useThemeColor(["background", "foreground"]);

  return (
    <TicketsProvider sync={asyncStorageSync}>
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
