import { createContext, use, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Table as TSTable,
} from "@tanstack/react-table";

import { productsTableColumns } from "./columns";
import type { Product } from "@inventory/application/collections/products.collection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";

interface Context {
  table: TSTable<Product>;
  columnsLength: number;
}

interface RootProps {
  products: Product[];
  orgSlug: string;
  children: React.ReactNode;
}

const ProductsContext = createContext<Context | null>(null);

function useProductsTable() {
  const context = use(ProductsContext);

  if (!context)
    throw new Error(
      "useProductsTableContext must be used within a ProductsTableProvider",
    );

  return context;
}

function Root({ products, orgSlug, children }: RootProps) {
  const columns = useMemo(() => productsTableColumns(orgSlug), [orgSlug]);

  const table = useReactTable({
    columns,
    data: products,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <ProductsContext.Provider value={{ table, columnsLength: columns.length }}>
      {children}
    </ProductsContext.Provider>
  );
}

function Content({ emptyMessage = "No hay productos" }) {
  const { table, columnsLength } = useProductsTable();

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="text-center"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="**:data-[slot=table-cell]:first:w-8">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center h-20">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-20 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const ProductsTable = {
  useProductsTable,
  Root,
  Content,
};
