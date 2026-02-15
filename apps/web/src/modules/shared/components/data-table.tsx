import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type TableOptions,
  type Table as TSTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { Button } from "@/modules/shared/components/ui/button";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { TableSizes } from "@/modules/shared/lib/constants";

interface WithTableProps<T> {
  table: TSTable<T>;
}

interface DataTableProps<T> {
  data: TableOptions<T>["data"];
  columns: TableOptions<T>["columns"];
  getRowId: TableOptions<T>["getRowId"];
}

function NextButton<T>({ table }: WithTableProps<T>) {
  return (
    <Button
      size="icon-sm"
      variant="outline"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      <ChevronRightIcon />
    </Button>
  );
}

function PrevButton<T>({ table }: WithTableProps<T>) {
  return (
    <Button
      size="icon-sm"
      variant="outline"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      <ChevronLeftIcon />
    </Button>
  );
}

function FirstPageButton<T>({ table }: WithTableProps<T>) {
  return (
    <Button
      size="icon-sm"
      variant="outline"
      onClick={() => table.firstPage()}
      disabled={!table.getCanPreviousPage()}
    >
      <ChevronsLeftIcon />
    </Button>
  );
}

function LastPageButton<T>({ table }: WithTableProps<T>) {
  return (
    <Button
      size="icon-sm"
      variant="outline"
      onClick={() => table.lastPage()}
      disabled={!table.getCanNextPage()}
    >
      <ChevronsRightIcon />
    </Button>
  );
}

function PageSizeSelect<T>({ table }: WithTableProps<T>) {
  const pageSize = table.getState().pagination.pageSize;

  return (
    <Select
      items={TableSizes}
      defaultValue={pageSize.toString()}
      value={pageSize.toString()}
      onValueChange={(value) => {
        table.setPageSize(Number(value));
      }}
    >
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger>
        <SelectGroup>
          {TableSizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              <span>{size.label}</span>
              {pageSize === size.value ? <CheckIcon /> : null}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function Content<T>({
  table,
  columnsLength,
  emptyMessage,
}: WithTableProps<T> & { columnsLength: number; emptyMessage: string }) {
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
                  <TableCell key={cell.id} className="text-center h-24">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function useDataTable<T>({
  data,
  columns,
  getRowId,
}: DataTableProps<T>) {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    rowCount: data.length,
    getRowId,
  });

  const components = useMemo(
    () => ({
      Content: ({ emptyMessage = "No elementos." }) => (
        <Content
          table={table}
          columnsLength={columns.length}
          emptyMessage={emptyMessage}
        />
      ),
      NextButton: () => <NextButton table={table} />,
      PrevButton: () => <PrevButton table={table} />,
      FirstPageButton: () => <FirstPageButton table={table} />,
      LastPageButton: () => <LastPageButton table={table} />,
      PageSizeSelect: () => <PageSizeSelect table={table} />,
    }),
    [table, columns.length],
  );

  return { ...table, ...components };
}
