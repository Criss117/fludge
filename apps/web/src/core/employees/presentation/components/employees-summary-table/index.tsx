import { createContext, use } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type Table as RTable,
} from "@tanstack/react-table";
import { Table } from "@/core/shared/components/ui/table";
import type { UserSummary } from "@repo/core/entities/user";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";
import { columns, completeColumns } from "./columns";

interface RootProps {
  children: React.ReactNode;
  data: UserSummary[];
  variant?: "detail" | "summary";
  businessId: string;
}

interface Context {
  table: RTable<UserSummary>;
}

interface ContentProps {
  children: React.ReactNode;
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

function Root({ children, data, variant = "summary", businessId }: RootProps) {
  const table = useReactTable({
    columns: variant === "detail" ? completeColumns(businessId) : columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <EmployeesTableContext.Provider
      value={{
        table,
      }}
    >
      {children}
    </EmployeesTableContext.Provider>
  );
}

function Content({ children }: ContentProps) {
  return <Table>{children}</Table>;
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
  Content,
};
