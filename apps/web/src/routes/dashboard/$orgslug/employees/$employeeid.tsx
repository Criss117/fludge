import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/$orgslug/employees/$employeeid',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/$orgslug/employees/$employeeid"!</div>
}
