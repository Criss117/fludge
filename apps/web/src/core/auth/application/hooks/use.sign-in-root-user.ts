import { useMutation } from "@tanstack/react-query";
import { signInRootUserAction } from "../actions/sign-in-root-user.action";

type Data = Parameters<typeof signInRootUserAction>[number];

export function useSignInRootUser() {
  const mutate = useMutation({
    mutationFn: async (args: Data) => {
      const res = await signInRootUserAction(args);

      if (res.error) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res;
    },
  });

  return mutate;
}
