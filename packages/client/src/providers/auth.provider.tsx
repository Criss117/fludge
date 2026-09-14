import {
  mutationOptions,
  QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { createAuthClient } from "better-auth/client";
import { createContext, use, useMemo, Suspense, type ReactNode } from "react";
import { useNetwork } from "./network-status.provider";

type AuthClient = ReturnType<typeof createAuthClient>;

type SessionData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    isRoot: boolean;
  };
};
export interface AuthContextAdapter {
  getSession: AuthClient["getSession"];
  signUpEmail: AuthClient["signUp"]["email"];
  signInEmail: AuthClient["signIn"]["email"];
  signOut: AuthClient["signOut"];
}

export interface ISessionStorage {
  save(session: SessionData): Promise<void>;
  load(): Promise<SessionData | null>;
  clear(): Promise<void>;
}

function authOptions(
  authClient: AuthContextAdapter,
  queryClient: QueryClient,
  sessionStorage: ISessionStorage,
  isInternetReachable: boolean | null,
) {
  const session = queryOptions({
    queryKey: ["session"],
    queryFn: async () => {
      if (!isInternetReachable) {
        return sessionStorage.load();
      }

      try {
        const { data, error } = await authClient.getSession();

        if (error) {
          if (error.status === 401 || error.status === 403) {
            await sessionStorage.clear();
            return null;
          }

          return sessionStorage.load();
        }

        if (!data) return null;

        const sessionData = data.session as typeof data.session;
        const userData = data.user as typeof data.user & { isRoot: boolean };

        const result = { ...sessionData, user: userData } satisfies SessionData;
        await sessionStorage.save(result);
        return result;
      } catch (networkError) {
        // La request nunca completó (sin red, timeout, DNS, etc.)
        return sessionStorage.load();
      }
    },
    refetchOnReconnect: true,
  });

  const signUpEmail = mutationOptions({
    mutationKey: ["signUpEmail"],
    mutationFn: async (
      values: Parameters<AuthContextAdapter["signUpEmail"]>[0],
    ) => {
      const { error } = await authClient.signUpEmail(values, {
        query: { disableCookieCache: true },
      });

      if (error) throw new Error(error.message, { cause: error });

      await queryClient.invalidateQueries(session);
    },
  });

  const signInEmail = mutationOptions({
    mutationKey: ["signInEmail"],
    mutationFn: async (
      values: Parameters<AuthContextAdapter["signInEmail"]>[0],
    ) => {
      const { error } = await authClient.signInEmail(values);

      if (error) throw new Error(error.message, { cause: error });

      await queryClient.invalidateQueries({ queryKey: session.queryKey });
    },
  });

  const signOut = mutationOptions({
    mutationKey: ["signOut"],
    mutationFn: async () => {
      const { error } = await authClient.signOut();

      if (error) throw new Error(error.message, { cause: error });

      await sessionStorage.clear();

      await queryClient.invalidateQueries({ queryKey: session.queryKey });
    },
  });

  return { session, signUpEmail, signInEmail, signOut };
}

function useAuthState(
  authClient: AuthContextAdapter,
  queryClient: QueryClient,
  sessionStorage: ISessionStorage,
) {
  const { isInternetReachable } = useNetwork();
  const options = useMemo(
    () =>
      authOptions(authClient, queryClient, sessionStorage, isInternetReachable),
    [authClient, queryClient, sessionStorage, isInternetReachable],
  );

  const session = useSuspenseQuery(options.session);

  const signUpEmail = useMutation(options.signUpEmail);
  const signInEmail = useMutation(options.signInEmail);
  const signOut = useMutation(options.signOut);

  return useMemo(
    () => ({
      authClient,
      session,
      signUpEmail,
      signInEmail,
      signOut,
    }),
    [authClient, session, signUpEmail, signInEmail, signOut],
  );
}

type Context = ReturnType<typeof useAuthState>;

const AuthContext = createContext<Context | null>(null);

export function AuthProvider({
  children,
  authClient,
  fallback = null,
  sessionStorage,
}: {
  children: ReactNode;
  authClient: AuthContextAdapter;
  fallback?: ReactNode;
  sessionStorage: ISessionStorage;
}) {
  return (
    <Suspense fallback={fallback}>
      <AuthProviderInner
        authClient={authClient}
        sessionStorage={sessionStorage}
      >
        {children}
      </AuthProviderInner>
    </Suspense>
  );
}

function AuthProviderInner({
  children,
  authClient,
  sessionStorage,
}: {
  children: ReactNode;
  authClient: AuthContextAdapter;
  sessionStorage: ISessionStorage;
}) {
  const queryClient = useQueryClient();
  const value = useAuthState(authClient, queryClient, sessionStorage);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  return context;
}
