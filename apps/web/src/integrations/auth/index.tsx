import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { env } from "@fludge/env/web";
import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import type { auth } from "@fludge/auth";
import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useRouter } from "@tanstack/react-router";

const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [organizationClient(), inferAdditionalFields<typeof auth>()],
});

type SignInData = {
  email: string;
  password: string;
};

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { orpc } = useORPC();

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
  });

  return {
    session: session.data,
    refetchSession: session.refetch,
    signInEmail,
    signUp,
    signOut,
  };
}
