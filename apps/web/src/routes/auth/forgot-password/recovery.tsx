import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/forgot-password/recovery')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/forgor-password/recovery"!</div>
}
