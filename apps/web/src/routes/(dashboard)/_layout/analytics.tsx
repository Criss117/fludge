import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboard)/_layout/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(dashboard)/_layout/analitics"!</div>
}
