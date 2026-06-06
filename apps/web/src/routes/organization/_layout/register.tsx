import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/organization/_layout/register")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const organizations = await context.queryClient.ensureQueryData(
      context.orpc.organizations.queries.findAll.queryOptions(),
    );

    return {
      organizations,
    };
  },
  loader: async ({ context }) => {
    return context.organizations;
  },
});

function RouteComponent() {
  return <div>Hello "/(dashboard)/organization/register"!</div>;
}
