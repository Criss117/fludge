import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(private)/business/$id/employees/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/business/$id/employees/create"!</div>
}
