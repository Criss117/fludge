import { Suspense } from "react";
import { EmployeesHeaderSection } from "../sections/employees-header.section";
import { EmployeesListSection } from "../sections/employees-list.section";
import { FiltersProvider } from "@/modules/shared/store/teams-filters.store";

interface Props {
  orgSlug: string;
}

export function EmployeesScreen({ orgSlug }: Props) {
  return (
    <div className="px-5 mt-4 space-y-5">
      <Suspense>
        <EmployeesHeaderSection />
      </Suspense>

      <Suspense fallback={<div>cargando...</div>}>
        <FiltersProvider>
          <EmployeesListSection orgSlug={orgSlug} />
        </FiltersProvider>
      </Suspense>
    </div>
  );
}
