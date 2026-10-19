import type { createAuthClient } from "better-auth/client";

type AuthClient = ReturnType<typeof createAuthClient>;

export interface SessionRepository {
  getSession: AuthClient["getSession"];

  signUpEmail: AuthClient["signUp"]["email"];

  signInEmail: AuthClient["signIn"]["email"];

  signOut: AuthClient["signOut"];
}
