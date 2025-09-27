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
import { Button } from "@/core/shared/components/ui/button";

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
    getPaginationRowModel: getCoreRowModel(),
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

function PaginationControllers() {
  const { table } = useProductSummaryTable();

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Anterior
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Siguiente
      </Button>
    </div>
  );
}

export const ProductSummaryTable = {
  useProductSummaryTable,
  Root,
  Content,
  Header,
  Body,
  PaginationControllers,
};
