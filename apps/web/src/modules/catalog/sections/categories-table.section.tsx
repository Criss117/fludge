import { useFindAllCategories } from "@fludge/client/application/catalog/hooks/use-find-categories";
import { useCategoriesTable } from "@fludge/client/application/catalog/hooks/use-table";
import { categoriesTableColumns } from "@fludge/client/presentation/catalog/tables/categories/columns";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";
import { BaseTable } from "@fludge/client/presentation/shared/tables/base-table.web";
import { CategoriesTableActions } from "@fludge/client/presentation/catalog/tables/categories/actions.web";
import {
  PageSize,
  FirstPage,
  PrevPage,
  NextPage,
  LastPage,
} from "@fludge/client/presentation/shared/tables/pagination.web";
import { Skeleton } from "@fludge/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fludge/ui/components/table";

interface Props {
  organizationId: string;
  canUpdate: boolean;
  canDelete: boolean;
}

export function CategoriesTableSection({
  organizationId,
  canUpdate,
  canDelete,
}: Props) {
  const { filters } = useFilters();

  const { data: categories } = useFindAllCategories(organizationId, {
    name: filters.query,
  });

  const columns = categoriesTableColumns({
    renderActions: (row) => (
      <CategoriesTableActions
        row={row}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onUpdateClick={() => {}}
        onDeleteClick={() => {}}
        onActivateClick={() => {}}
        onDeactivateClick={() => {}}
      />
    ),
  });

  const table = useCategoriesTable({
    data: categories,
    columns: columns,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden border">
        <BaseTable
          table={table}
          columnsLength={columns.length}
          EmptyComponent={
            <div className="text-center">No se encontraron categorías</div>
          }
        />
      </div>

      <div className="flex items-start justify-between px-2 py-4">
        <div className="flex gap-1 flex-col">
          <PageSize
            pageSize={table.getState().pagination.pageSize}
            setPageSize={(size) => table.setPageSize(size)}
          />
          <div className="text-sm text-muted-foreground">
            Página <span className="font-medium">{pageIndex + 1}</span> de{" "}
            <span className="font-medium">{pageCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4">
          <FirstPage
            firstPage={() => table.firstPage()}
            canPreviousPage={table.getCanPreviousPage()}
          />
          <PrevPage
            previusPage={() => table.previousPage()}
            canPreviousPage={table.getCanPreviousPage()}
          />
          <NextPage
            nextPage={() => table.nextPage()}
            canNextPage={table.getCanNextPage()}
          />
          <LastPage
            lastPage={() => table.lastPage()}
            canNextPage={table.getCanNextPage()}
          />
        </div>
      </div>
    </section>
  );
}

const CATEGORIES_TABLE_HEADERS = [
  "Nombre",
  "Slug",
  "Estado",
  "Última Actualización",
  "Creado Por",
  "Acciones",
];

const SKELETON_ROWS = Array.from({ length: 5 });

export function CategoriesTableSectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden border">
        <Table>
          <TableHeader className="bg-card">
            <TableRow>
              {CATEGORIES_TABLE_HEADERS.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_ROWS.map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-6 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-start justify-between px-2 py-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-44" />
      </div>
    </section>
  );
}
