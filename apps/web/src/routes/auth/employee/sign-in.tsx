import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/employee/sign-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/employee/sign-in"!</div>
}
