import { createContext, use, useEffect, useState } from "react";
import type { LogedUser } from "@repo/core/entities/user";

import { config } from "@/core/shared/lib/config";
import { getProfileAction } from "../actions/get-profile.action";
import { LoadingPage } from "@/core/shared/components/loading-page";

type SignInOptions = {
  onSuccess?: (logedUser: LogedUser) => void;
  onError?: () => void;
};

type SignOutOptions = {
  onSuccess?: () => void;
};

interface Context {
  jwt: string | null;
  user: LogedUser | null;
  signIn: (jwt: string, options?: SignInOptions) => Promise<void>;
  signOut: (options?: SignOutOptions) => void;
}

const AuthContext = createContext<Context | null>(null);

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<LogedUser | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const signIn = async (jwt: string, options?: SignInOptions) => {
    setJwt(jwt);
    setUser(null);
    localStorage.setItem(config.tokenKey.toString(), jwt.toString());

    await getProfileAction(jwt).then(async (res) => {
      if (res.error) {
        setUser(null);
        options?.onError?.();
        return;
      }

      if (!res.data) {
        setUser(null);
        options?.onError?.();
        return;
      }

      setUser(res.data);
      options?.onSuccess?.(res.data);
    });
  };

  const signOut = (options?: SignOutOptions) => {
    setJwt(null);
    setUser(null);
    localStorage.removeItem(config.tokenKey.toString());
    options?.onSuccess?.();
  };

  useEffect(() => {
    const jwt = localStorage.getItem(config.tokenKey.toString());

    if (jwt) {
      signIn(jwt).finally(() => {
        setIsFirstLoad(false);
      });

      return;
    }

    setIsFirstLoad(false);
  }, []);

  if (isFirstLoad) {
    return <LoadingPage />;
  }

  return (
    <AuthContext.Provider
      value={{
        jwt,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
