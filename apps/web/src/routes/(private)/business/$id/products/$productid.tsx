import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(private)/business/$id/products/$productid',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/business/$id/products/productid"!</div>
}
