import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/business/$id/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/business/$id/settings"!</div>
}
