import { createContext, use } from "react";
import {
  useEmployeesSummaryTable,
  columns,
} from "@repo/ui/employees/hooks/use.employees-summary-table";
import { Table } from "@/core/shared/components/ui/table";
import type { UserSummary } from "@repo/core/entities/user";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";

interface RootProps {
  children: React.ReactNode;
  data: UserSummary[];
}

interface Context {
  table: ReturnType<typeof useEmployeesSummaryTable>;
}

const EmployeesTableContext = createContext<Context | null>(null);

function useEmployeesTable() {
  const context = use(EmployeesTableContext);

  if (!context) {
    throw new Error(
      "useEmployeesTable must be used within an EmployeesTableProvider"
    );
  }

  return context;
}

function Root({ children, data }: RootProps) {
  const table = useEmployeesSummaryTable(data);

  return (
    <EmployeesTableContext.Provider
      value={{
        table,
      }}
    >
      <Table>{children}</Table>
    </EmployeesTableContext.Provider>
  );
}

function Header() {
  const { table } = useEmployeesTable();

  return <CommonTableHeader table={table} />;
}

function Body() {
  const { table } = useEmployeesTable();
  return (
    <CommonTableBody
      table={table}
      colSpan={columns.length}
      emptyMessage="No hay empleados registrados"
    />
  );
}

export const EmployeesSummaryTable = {
  useEmployeesTable,
  Root,
  Header,
  Body,
};
