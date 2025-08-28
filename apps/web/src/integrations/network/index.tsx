import { useEffect, useState } from "react";
import { LoadingPage } from "@/core/shared/components/loading-page";
import api from "@/core/shared/lib/api";

export function Network({ children }: { children: React.ReactNode }) {
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    api.get("/health").then(() => {
      setIsPending(false);
    });
  }, []);

  if (isPending) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
