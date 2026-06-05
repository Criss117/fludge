import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboard)/_layout/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(dashboard)/_layout/inventory"!</div>
}
