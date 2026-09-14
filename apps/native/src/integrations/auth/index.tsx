import { expoClient } from "@better-auth/expo/client";
import { env } from "@fludge/env/native";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import {
  AuthProvider as AProvider,
  type ISessionStorage,
  type AuthContextAdapter,
} from "@fludge/client/providers/auth.provider";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { SESSION_LOCAL_STORAGE_KEY } from "@/modules/shared/utils/constanst";

// react-doctor-disable-next-line only-export-components -- Better Auth client is an integration singleton shared by the provider.
export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
    }),
  ],
});

const sessionStorage: ISessionStorage = {
  load: async () => {
    const session = await SecureStore.getItemAsync(SESSION_LOCAL_STORAGE_KEY);
    return session ? JSON.parse(session) : null;
  },
  save: async (session) => {
    await SecureStore.setItemAsync(
      SESSION_LOCAL_STORAGE_KEY,
      JSON.stringify(session)
    );
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(SESSION_LOCAL_STORAGE_KEY);
  },
};

const authAdapter: AuthContextAdapter = {
  getSession: authClient.getSession,
  signUpEmail: authClient.signUp.email,
  signInEmail: authClient.signIn.email,
  signOut: authClient.signOut,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AProvider
      sessionStorage={sessionStorage}
      authClient={authAdapter}
      fallback={<LoadingScreen message={"app.loading_session"} />}
    >
      {children}
    </AProvider>
  );
}
