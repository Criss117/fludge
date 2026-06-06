import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@fludge/ui/components/button";
import { useSetActiveOrganization } from "@/modules/iam/hooks/use-set-active-organization";

export const Route = createFileRoute("/organization/_layout/select")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const organizations = await context.queryClient.ensureQueryData(
      context.orpc.organizations.queries.findAll.queryOptions(),
    );

    if (organizations.length === 0) {
      throw redirect({
        to: "/organization/register",
      });
    }

    return {
      organizations,
    };
  },
  loader: async ({ context }) => {
    return context.organizations;
  },
});

function RouteComponent() {
  const organizations = Route.useLoaderData();

  const setActiveOrganization = useSetActiveOrganization();

  const handleClick = (org: { id: string; slug: string }) => {
    setActiveOrganization.mutate(org, {
      onSuccess: () => {
        window.location.replace("/");
      },
    });
  };

  return (
    <div>
      {organizations.map((organization) => (
        <Button
          key={organization.id}
          onClick={() =>
            handleClick({
              id: organization.id,
              slug: organization.slug,
            })
          }
        >
          {organization.name}
        </Button>
      ))}
    </div>
  );
}
