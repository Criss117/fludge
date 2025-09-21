import { createContext, use } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type Table as RTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import type { CategorySummary } from "@repo/core/entities/category";
import { Table } from "@/core/shared/components/ui/table";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";

interface Context {
  table: RTable<CategorySummary>;
}

interface RootProps {
  data: CategorySummary[];
  children: React.ReactNode;
}

interface ContentProps {
  children: React.ReactNode;
}

const CategorySummaryTableContext = createContext<Context | null>(null);

function useCategorySummaryTable() {
  const context = use(CategorySummaryTableContext);

  if (!context) {
    throw new Error("CategorySummaryTableContext not found");
  }

  return context;
}

function Root({ children, data }: RootProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <CategorySummaryTableContext.Provider value={{ table }}>
      {children}
    </CategorySummaryTableContext.Provider>
  );
}

function Content({ children }: ContentProps) {
  return <Table>{children}</Table>;
}

function Header() {
  const { table } = useCategorySummaryTable();

  return <CommonTableHeader table={table} />;
}

function Body() {
  const { table } = useCategorySummaryTable();

  return (
    <CommonTableBody
      table={table}
      colSpan={4}
      emptyMessage="No hay categorías"
    />
  );
}

export const CategorySummaryTable = {
  useCategorySummaryTable,
  Root,
  Content,
  Header,
  Body,
};
