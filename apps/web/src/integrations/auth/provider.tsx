import { createContext, use } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { MutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  ORPCContextType,
  useORPC,
} from "@fludge/client/providers/orpc.provider";
import { authClient } from ".";

type SignUpMutationOptions = ReturnType<
  ORPCContextType["orpc"]["auth"]["commands"]["signUpEmail"]["mutationOptions"]
>;

export type Session = Awaited<
  ReturnType<ORPCContextType["orpc"]["auth"]["queries"]["getSession"]["call"]>
>;

type InferMutationResult<T extends MutationOptions<any, any, any, any>> =
  T extends MutationOptions<infer D, infer E, infer V, infer R>
    ? UseMutationResult<D, E, V, R>
    : never;

type SignUpMutationResult = InferMutationResult<SignUpMutationOptions>;

interface Context {
  signInEmail: UseMutationResult<void, Error, SignInData, unknown>;
  signUp: SignUpMutationResult;
  signOut: UseMutationResult<void, Error, void, unknown>;
  session: Session;
}

type SignInData = {
  email: string;
  password: string;
};

const AuthContext = createContext<Context | null>(null);

export function useAuth() {
  const c = use(AuthContext);

  if (!c) throw new Error("Auth context not found");

  return c;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { orpc } = useORPC();
  const queryClient = useQueryClient();
  const session = useSuspenseQuery(orpc.auth.queries.getSession.queryOptions());

  const signInEmail = useMutation({
    mutationKey: ["auth", "signInEmail"],
    mutationFn: async ({ email, password }: SignInData) => {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
        fetchOptions: {
          onSuccess: async () => {
            session.refetch();
          },
        },
      });
    },
  });

  const signUp = useMutation(
    orpc.auth.commands.signUpEmail.mutationOptions({
      onSuccess: () => {
        router.navigate({
          to: "/",
        });
      },
    }),
  );

  const signOut = useMutation({
    mutationKey: ["auth", "sign-out"],
    mutationFn: async () => {
      await authClient.signOut();
      queryClient.invalidateQueries();
      queryClient.setQueryData(
        orpc.auth.queries.getSession.queryOptions().queryKey,
        null,
      );
    },
    onSuccess: () => {
      router.options.context.session = null;
      router.navigate({
        to: "/auth/sign-in",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{ signInEmail, signUp, session: session.data, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
