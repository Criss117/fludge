import { createContext, use } from "react";
import type { GroupSummary } from "@repo/core/entities/group";
import {
  useGroupsSummaryTable,
  columns,
} from "@repo/ui/business/hooks/use.groups-summary-table";
import { Table } from "@/core/shared/components/ui/table";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";

interface RootProps {
  children: React.ReactNode;
  data: GroupSummary[];
}

interface Context {
  table: ReturnType<typeof useGroupsSummaryTable>;
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

function Root({ children, data }: RootProps) {
  const table = useGroupsSummaryTable(data);

  return (
    <GroupTableContext.Provider value={{ table }}>
      <Table>{children}</Table>
    </GroupTableContext.Provider>
  );
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

export const GroupsSummaryTable = {
  useGroupsTable,
  Root,
  Header,
  Body,
};
