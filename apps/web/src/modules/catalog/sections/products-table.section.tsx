import { useFindAllProducts } from "@fludge/client/application/catalog/hooks/use-find-products";
import { useProductsTable } from "@fludge/client/application/catalog/hooks/use-table";
import { productsTableColumns } from "@fludge/client/presentation/catalog/tables/products/columns";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";
import { BaseTable } from "@fludge/client/presentation/shared/tables/base-table.web";
import { ProductsTableActions } from "@fludge/client/presentation/catalog/tables/products/actions.web";
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

export function ProductsTableSection({
  organizationId,
  canUpdate,
  canDelete,
}: Props) {
  const { filters } = useFilters();

  const { data: products } = useFindAllProducts(organizationId, {
    query: filters.query,
  });

  const columns = productsTableColumns({
    renderActions: (row) => (
      <ProductsTableActions
        row={row}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onUpdateClick={() => {}}
        onDeleteClick={() => {}}
        onActivateClick={() => {}}
        onDeactivateClick={() => {}}
        onDiscontinueClick={() => {}}
      />
    ),
  });

  const table = useProductsTable({
    data: products,
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
            <div className="text-center">No se encontraron productos</div>
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

const PRODUCTS_TABLE_HEADERS = [
  "Nombre",
  "Slug",
  "SKU",
  "Código de Barras",
  "Precio Venta",
  "Stock",
  "Estado",
  "Categoría",
  "Creado Por",
  "Última Actualización",
  "Acciones",
];

const SKELETON_ROWS = Array.from({ length: 5 });

export function ProductsTableSectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden border">
        <Table>
          <TableHeader className="bg-card">
            <TableRow>
              {PRODUCTS_TABLE_HEADERS.map((header) => (
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
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
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