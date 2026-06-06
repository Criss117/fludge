import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageHeaderItem } from "@/components/page-header";

export const Route = createFileRoute("/(dashboard)/_layout/groups/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <PageHeader>
        <PageHeaderItem label="Grupos" />
      </PageHeader>
    </main>
  );
}
