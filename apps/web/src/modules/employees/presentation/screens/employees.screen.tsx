import { Suspense } from "react";

import { FiltersProvider } from "@shared/store/teams-filters.store";

import { EmployeesHeaderSection } from "@employees/presentation/sections/employees-header.section";
import { EmployeesListSection } from "@employees/presentation/sections/employees-list.section";

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
