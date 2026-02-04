import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/employee')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/employee"!</div>
}
