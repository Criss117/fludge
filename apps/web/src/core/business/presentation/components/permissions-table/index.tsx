import { createContext, use } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type Table as RTable,
} from "@tanstack/react-table";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";
import { Table } from "@/core/shared/components/ui/table";
import { columns, columnsWithSelect } from "./columns";
import type { Permission } from "@repo/core/value-objects/permission";

interface RootProps {
  children: React.ReactNode;
  data: Permission[];
  hiddeSelect?: boolean;
}

interface ContentProps {
  children: React.ReactNode;
}

interface Context {
  table: RTable<Permission>;
}

const PermissionsTableContext = createContext<Context | null>(null);

function usePermissionsTable() {
  const context = use(PermissionsTableContext);

  if (!context) {
    throw new Error(
      "usePermissionsTable must be used within an PermissionsTableProvider"
    );
  }

  return context;
}

function Root({ children, data, hiddeSelect = false }: RootProps) {
  const table = useReactTable({
    columns: hiddeSelect ? columns : columnsWithSelect,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PermissionsTableContext.Provider
      value={{
        table,
      }}
    >
      {children}
    </PermissionsTableContext.Provider>
  );
}

function Content({ children }: ContentProps) {
  return <Table>{children}</Table>;
}

function Header() {
  const { table } = usePermissionsTable();

  return <CommonTableHeader table={table} />;
}

function Body() {
  const { table } = usePermissionsTable();
  return <CommonTableBody table={table} colSpan={columns.length} />;
}

export const PermissionsTable = {
  usePermissionsTable,
  Root,
  Header,
  Body,
  Content,
};
