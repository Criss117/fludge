import { expoClient } from "@better-auth/expo/client";
import { env } from "@fludge/env/native";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import {
  AuthProvider as AProvider,
  type AuthContextAdapter,
} from "@fludge/client/providers/auth.provider";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";

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

const authAdapter: AuthContextAdapter = {
  getSession: authClient.getSession,
  signUpEmail: authClient.signUp.email,
  signInEmail: authClient.signIn.email,
  signOut: authClient.signOut,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AProvider
      authClient={authAdapter}
      fallback={<LoadingScreen message={"app.loading_session"} />}
    >
      {children}
    </AProvider>
  );
}
