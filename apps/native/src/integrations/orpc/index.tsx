import { createOrpcProvider } from "@fludge/client/providers/orpc.provider";
import { env } from "@fludge/env/native";
import { Platform } from "react-native";
import { authClient } from "../auth";

export const ORPCProvider = createOrpcProvider({
  url: `${env.EXPO_PUBLIC_SERVER_URL}/rpc`,
  headers: async () => {
    if (Platform.OS === "web") {
      return {};
    }
    const headers = new Map<string, string>();
    const cookies = await authClient.getCookie();
    if (cookies) {
      headers.set("Cookie", cookies);
    }
    return Object.fromEntries(headers);
  },
});
