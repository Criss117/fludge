import { createContext, use } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type Table as RTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { Table } from "@/core/shared/components/ui/table";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";
import type { ProductSummary } from "@repo/core/entities/product";

interface Context {
  table: RTable<ProductSummary>;
}

interface RootProps {
  data: ProductSummary[];
  children: React.ReactNode;
}

interface ContentProps {
  children: React.ReactNode;
}

const ProductSummaryTableContext = createContext<Context | null>(null);

function useProductSummaryTable() {
  const context = use(ProductSummaryTableContext);

  if (!context) {
    throw new Error("ProductSummaryTableContext not found");
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
    <ProductSummaryTableContext.Provider value={{ table }}>
      {children}
    </ProductSummaryTableContext.Provider>
  );
}

function Content({ children }: ContentProps) {
  return <Table>{children}</Table>;
}

function Header() {
  const { table } = useProductSummaryTable();

  return <CommonTableHeader table={table} />;
}

function Body() {
  const { table } = useProductSummaryTable();

  return (
    <CommonTableBody
      table={table}
      colSpan={4}
      emptyMessage="No hay categorías"
    />
  );
}

export const ProductSummaryTable = {
  useProductSummaryTable,
  Root,
  Content,
  Header,
  Body,
};
