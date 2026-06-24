import { PageHeader, PageHeaderItem } from "@/components/page-header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/_layout/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <PageHeader>
        <PageHeaderItem label="Productos" />
      </PageHeader>
    </main>
  );
}
