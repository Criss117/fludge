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
import { useOrpc } from "./orpc.provider";

type AuthClient = ReturnType<typeof createAuthClient>;

export interface AuthContextAdapter {
  getSession: AuthClient["getSession"];
  signUpEmail: AuthClient["signUp"]["email"];
  signInEmail: AuthClient["signIn"]["email"];
  signOut: AuthClient["signOut"];
}

function authOptions(authClient: AuthContextAdapter, queryClient: QueryClient) {
  const session = queryOptions({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error || !data) return null;

      const sessionData = data.session as typeof data.session & {
        activeOrganizationId: string | null;
      };

      const userData = data.user as typeof data.user & {
        isRoot: boolean;
      };

      console.log({
        ...sessionData,
        activeOrganizationId: sessionData.activeOrganizationId as unknown as
          string | null,
        user: userData,
      });

      return {
        ...sessionData,
        activeOrganizationId: sessionData.activeOrganizationId as unknown as
          string | null,
        user: userData,
      };
    },
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

      await queryClient.invalidateQueries({ queryKey: session.queryKey });
    },
  });
  return { session, signUpEmail, signInEmail, signOut };
}

// 👇 Este es el truco: aquí se "ejecutan" los hooks, y el tipo de retorno
// de esta función es exactamente lo que queremos en el Context.
// No escribimos ningún tipo a mano — todo se infiere desde authOptions.
function useAuthState(
  authClient: AuthContextAdapter,
  queryClient: QueryClient,
) {
  const orpc = useOrpc();
  const options = useMemo(
    () => authOptions(authClient, queryClient),
    [authClient, queryClient],
  );

  const session = useSuspenseQuery(options.session);
  const signUpEmail = useMutation(options.signUpEmail);
  const signInEmail = useMutation(options.signInEmail);
  const signOut = useMutation(options.signOut);
  const setActiveOrganization = useMutation(
    orpc.auth.commands.setActiveOrganization.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
      },
    }),
  );

  return useMemo(
    () => ({
      authClient,
      session,
      signUpEmail,
      signInEmail,
      signOut,
      setActiveOrganization,
    }),
    [
      authClient,
      session,
      signUpEmail,
      signInEmail,
      signOut,
      setActiveOrganization,
    ],
  );
}

// El Context se tipa con ReturnType de useAuthState — cero anotación manual.
type Context = ReturnType<typeof useAuthState>;

const AuthContext = createContext<Context | null>(null);

export function AuthProvider({
  children,
  authClient,
  fallback = null,
}: {
  children: ReactNode;
  authClient: AuthContextAdapter;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <AuthProviderInner authClient={authClient}>{children}</AuthProviderInner>
    </Suspense>
  );
}

function AuthProviderInner({
  children,
  authClient,
}: {
  children: ReactNode;
  authClient: AuthContextAdapter;
}) {
  const queryClient = useQueryClient();
  const value = useAuthState(authClient, queryClient);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  return context;
}
