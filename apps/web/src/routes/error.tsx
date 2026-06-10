import { ErrorScreen } from "@/components/error.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ErrorScreen
      error={{
        message: "Algo salio mal",
        name: "INTERNAL_SERVER_ERROR",
      }}
      reset={() => {
        window.location.replace("/");
      }}
    />
  );
}
