import { createOrpcProvider } from "@fludge/client/providers/orpc.provider";
import { env } from "@fludge/env/native";
import { Platform } from "react-native";
import { ORGANIZATION_HEADER_KEY } from "@fludge/utils/constants";
import { authClient } from "../auth";
import { iamContainer } from "../dependencies/iam.container";

export const ORPCProvider = createOrpcProvider({
  url: `${env.EXPO_PUBLIC_SERVER_URL}/rpc`,
  headers: async () => {
    if (Platform.OS === "web") {
      return {};
    }
    const headers = new Map<string, string>();
    const cookies = await authClient.getCookie();

    let activeOrganizationId: string | null = null;

    try {
      const appStore = await iamContainer.repositories.appRepository.find();

      activeOrganizationId = appStore?.activeOrganizationId ?? null;
    } catch (error) {
      console.warn("Error obtaining organization cookie:", error);
    }

    if (cookies) headers.set("Cookie", cookies);

    if (activeOrganizationId)
      headers.set(ORGANIZATION_HEADER_KEY, activeOrganizationId);

    return Object.fromEntries(headers);
  },
});
