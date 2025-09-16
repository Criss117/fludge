import { createContext, use } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type Table as RTable,
} from "@tanstack/react-table";
import type { GroupSummary } from "@repo/core/entities/group";
import { Table } from "@/core/shared/components/ui/table";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";
import { columns } from "./columns";

interface RootProps {
  children: React.ReactNode;
  data: GroupSummary[];
  businessId: string;
}

interface ContentProps {
  children: React.ReactNode;
}

interface Context {
  table: RTable<GroupSummary>;
}

const GroupTableContext = createContext<Context | null>(null);

function useGroupsTable() {
  const context = use(GroupTableContext);

  if (!context) {
    throw new Error(
      "useGroupsTable must be used within an GroupsTableProvider"
    );
  }

  return context;
}

function Root({ children, data, businessId }: RootProps) {
  const table = useReactTable({
    columns: columns(businessId),
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <GroupTableContext.Provider value={{ table }}>
      {children}
    </GroupTableContext.Provider>
  );
}

function Content({ children }: ContentProps) {
  return <Table>{children}</Table>;
}

function Header() {
  const { table } = useGroupsTable();

  return <CommonTableHeader table={table} />;
}

function Body() {
  const { table } = useGroupsTable();
  return (
    <CommonTableBody
      table={table}
      colSpan={columns.length}
      emptyMessage="No hay grupos registrados"
    />
  );
}

export const GroupsTable = {
  useGroupsTable,
  Root,
  Header,
  Body,
  Content,
};
