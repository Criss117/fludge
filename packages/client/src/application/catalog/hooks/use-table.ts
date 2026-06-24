import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CategorySummary } from "./use-find-categories";
import type { CategoriesTableColumns } from "@fludge/client/presentation/catalog/tables/categories/columns";

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