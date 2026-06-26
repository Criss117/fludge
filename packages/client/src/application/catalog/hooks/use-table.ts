import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CategorySummary } from "./use-find-categories";
import type { ProductSummary } from "./use-find-products";
import type { CategoriesTableColumns } from "@fludge/client/presentation/catalog/tables/categories/columns";
import type { ProductsTableColumns } from "@fludge/client/presentation/catalog/tables/products/columns";

interface CategoriesParams<TNode> {
  data: CategorySummary[];
  columns: CategoriesTableColumns<TNode>;
}

export function useCategoriesTable<TNode>({
  data,
  columns,
}: CategoriesParams<TNode>) {
  return useReactTable({
    columns,
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}

interface ProductsParams<TNode> {
  data: ProductSummary[];
  columns: ProductsTableColumns<TNode>;
}

export function useProductsTable<TNode>({
  data,
  columns,
}: ProductsParams<TNode>) {
  return useReactTable({
    columns,
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}