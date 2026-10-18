import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";
import type { createAuthClient } from "better-auth/client";

type AuthClient = ReturnType<typeof createAuthClient>;

/**
 * Tipos de `data` inferidos por `better-auth` para el cliente (incluye los
 * campos que agregan los plugins), sin el wrapper `{ data, error }` que ahora
 * representa el `Result`.
 */
type AuthSession = AuthClient["$Infer"]["Session"];
type AuthUser = AuthSession["user"];

/** `data` de `getSession`: la sesión puede no existir. */
type GetSessionData = AuthSession | null;

/** `data` de `signUp.email`. */
type SignUpEmailData = { token: string | null; user: AuthUser };

/** `data` de `signIn.email`. */
type SignInEmailData = { redirect: boolean; token: string; url?: string; user: AuthUser };

/** `data` de `signOut`. */
type SignOutData = { success: boolean };

export interface SessionRepository {
  getSession: (
    ...args: Parameters<AuthClient["getSession"]>
  ) => Promise<Result<GetSessionData, RepositoryError>>;

  signUpEmail: (
    ...args: Parameters<AuthClient["signUp"]["email"]>
  ) => Promise<Result<SignUpEmailData, RepositoryError>>;

  signInEmail: (
    ...args: Parameters<AuthClient["signIn"]["email"]>
  ) => Promise<Result<SignInEmailData, RepositoryError>>;

  signOut: (
    ...args: Parameters<AuthClient["signOut"]>
  ) => Promise<Result<SignOutData, RepositoryError>>;
}
