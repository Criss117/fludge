import { AlertCircle } from "lucide-react";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { Button } from "@fludge/ui/components/button";

export function ErrorScreen({ error, reset }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center flex-col gap-y-2">
      <h1 className="text-7xl font-semibold">Fludge</h1>
      <div className="flex items-center gap-x-5">
        <AlertCircle size={24} className="text-destructive" />
        <p>Ocurrió un error inesperado</p>
      </div>

      <Button
        onClick={() => {
          reset();
        }}
      >
        Reintentar
      </Button>

      <div>
        <p>Mensaje: {error.message}</p>
      </div>
    </main>
  );
}
