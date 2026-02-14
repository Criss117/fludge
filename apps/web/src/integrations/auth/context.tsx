import {
  useMutation,
  useSuspenseQuery,
  type QueryObserverResult,
  type RefetchOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { createContext, use } from "react";
import { orpc } from "../orpc";
import type { SignInEmailSchema } from "@fludge/utils/validators/auth.schemas";
import { tryCatch } from "@fludge/utils/try-catch";
import { authClient } from ".";

export type Session = Awaited<ReturnType<typeof orpc.auth.getSession.call>>;

interface Context {
  session: Session;
  refetchSession: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<Session>>;
  signInEmail: UseMutationResult<Session, Error, SignInEmailSchema>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<Context | null>(null);

export function useAuth() {
  const context = use(AuthContext);

  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  return context;
}

export function useVerifiedSession() {
  const { session } = useAuth();

  if (!session)
    throw new Error("useVerifiedSession must be used within an AuthProvider");

  const activeOrgId = session.activeOrganizationId;

  if (!activeOrgId) throw new Error("Active organization ID is missing");

  return {
    ...session,
    activeOrganizationId: activeOrgId,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const sessionQuery = useSuspenseQuery(orpc.auth.getSession.queryOptions());

  const signInEmail = useMutation({
    mutationKey: ["sign-in-email"],
    mutationFn: async (values: SignInEmailSchema) => {
      const { error } = await tryCatch(
        authClient.signIn.email({
          email: values.email,
          password: values.password,
        }),
      );

      if (error) throw error;

      const session = await sessionQuery.refetch();

      if (!session.data) throw new Error("Algo salio mal");

      return session.data;
    },
  });

  return (
    <AuthContext.Provider
      value={{
        session: sessionQuery.data,
        refetchSession: sessionQuery.refetch,
        signInEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
