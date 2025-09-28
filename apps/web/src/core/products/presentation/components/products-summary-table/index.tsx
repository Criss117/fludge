import { createContext, use } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type Table as RTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { Table } from "@/core/shared/components/ui/table";
import { CommonTableHeader } from "@/core/shared/components/table/common-table-header";
import { CommonTableBody } from "@/core/shared/components/table/common-table-body";
import type { ProductSummary } from "@repo/core/entities/product";
import { Button } from "@/core/shared/components/ui/button";
import { Loader2Icon } from "lucide-react";

type Pagination = {
  pageIndex: number;
  pageSize: number;
};

interface Context {
  table: RTable<ProductSummary>;
  isPending: boolean;
}

interface RootProps {
  data: ProductSummary[];
  children: React.ReactNode;
  pagination: Pagination;
  setPagination: (pagination: Pagination) => void;
  isPending: boolean;
}

interface ContentProps {
  children: React.ReactNode;
}
interface PaginationControllersProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  fetchPreviousPage: () => void;
  fetchNextPage: () => void;
}

const ProductSummaryTableContext = createContext<Context | null>(null);

function useProductSummaryTable() {
  const context = use(ProductSummaryTableContext);

  if (!context) {
    throw new Error("ProductSummaryTableContext not found");
  }

  return context;
}

function Root({
  children,
  data,
  pagination,
  setPagination,
  isPending,
}: RootProps) {
  const table = useReactTable({
    data,
    columns,
    rowCount: data.length,
    manualPagination: true,
    state: {
      pagination,
    },
    onPaginationChange: (pag) => {
      if (typeof pag === "function") {
        const pagState = pag(pagination);

        setPagination(pagState);
      } else {
        setPagination(pag);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <ProductSummaryTableContext.Provider value={{ table, isPending }}>
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

function PaginationControllers({
  hasNextPage,
  hasPreviousPage,
  totalPages,
  fetchNextPage,
  fetchPreviousPage,
}: PaginationControllersProps) {
  const { table, isPending } = useProductSummaryTable();

  const handleNextPage = () => {
    fetchNextPage();
  };

  const handlePreviousPage = () => {
    fetchPreviousPage();
  };

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousPage}
        disabled={!hasPreviousPage}
      >
        {isPending && <Loader2Icon className="animate-spin" />}
        Anterior
      </Button>
      <span>
        {table.getState().pagination.pageIndex + 1} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNextPage}
        disabled={!hasNextPage}
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
