import { useAuth } from "@/core/auth/application/providers/auth.provider";
import { Button } from "./ui/button";
import { useRouter } from "@tanstack/react-router";

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <Button
      onClick={() =>
        signOut({
          onSuccess: () => {
            router.navigate({
              to: "/auth/sign-in",
            });
          },
        })
      }
    >
      Sign out
    </Button>
  );
}
