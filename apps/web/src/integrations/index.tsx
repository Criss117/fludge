import { AuthProvider } from "@/core/auth/application/providers/auth.provider";
import { Router } from "./router";
import { Network } from "./network";
import { TanstackQuery } from "./ts-query";
import { Toaster } from "sonner";

export function Integrations() {
  return (
    <Network>
      <AuthProvider>
        <TanstackQuery>
          <Router />
          <Toaster />
        </TanstackQuery>
      </AuthProvider>
    </Network>
  );
}
