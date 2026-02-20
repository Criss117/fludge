import { employeesCollectionBuilder } from "@/modules/employees/application/collections/employees.collection";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/dashboard/$orgslug/employees/$employeeid",
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const employeesCollection = employeesCollectionBuilder(
      context.selectedOrganization.id,
    );

    await employeesCollection.preload();

    const employee = Array.from(employeesCollection.entries()).find(
      ([_, employee]) => employee.id === params.employeeid,
    );

    if (!employee)
      throw redirect({
        to: "/dashboard/$orgslug/employees",
        params: { orgslug: params.orgslug },
      });

    return { employee };
  },
});

function RouteComponent() {
  const { orgslug, employeeid } = Route.useParams();
  const { employee } = Route.useLoaderData();

  return (
    <div>
      <pre>
        <code>{JSON.stringify(employee, null, 2)}</code>
      </pre>
    </div>
  );
}
