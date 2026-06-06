import { ErrorScreen } from "@/components/error.screen";
import { useRouter } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

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
