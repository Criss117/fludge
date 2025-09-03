import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/business/$id/groups/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/business/$id/groups/create"!</div>
}
