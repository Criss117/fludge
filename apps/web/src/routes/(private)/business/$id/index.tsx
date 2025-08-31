import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { SignOutButton } from "@/core/shared/components/sign-out-button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data } = useFindOneBusiness(id);

  return (
    <div>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
      <SignOutButton />
    </div>
  );
}
