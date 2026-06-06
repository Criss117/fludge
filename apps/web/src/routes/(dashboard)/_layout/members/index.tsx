import { PageHeader, PageHeaderItem } from "@/components/page-header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/_layout/members/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <PageHeader>
        <PageHeaderItem label="Miembros" />
      </PageHeader>
    </main>
  );
}
