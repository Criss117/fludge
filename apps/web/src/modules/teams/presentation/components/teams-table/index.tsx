import { createContext, use } from "react";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
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
import { defaultColumns } from "./columns";
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";

interface RootProps {
  teams: Team[];
  children: React.ReactNode;
  orgSlug: string;
}

interface Context {
  table: TSTable<Team>;
}

const TeamsTableContext = createContext<Context | null>(null);
const TableSizes = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 30, label: "30" },
  { value: 50, label: "50" },
];

function useTeamsTable() {
  const context = use(TeamsTableContext);
  if (!context)
    throw new Error("useTeamsTable must be used within a TeamsTableContext");

  return context;
}

function Root({ children, orgSlug, teams }: RootProps) {
  const table = useReactTable({
    data: teams,
    columns: defaultColumns(orgSlug),
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    rowCount: teams.length,
  });

  return (
    <TeamsTableContext.Provider value={{ table }}>
      {children}
    </TeamsTableContext.Provider>
  );
}

function Content() {
  const { table } = useTeamsTable();

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
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={defaultColumns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function NextButton() {
  const { table } = useTeamsTable();

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

function PrevButton() {
  const { table } = useTeamsTable();

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

function FirstPageButton() {
  const { table } = useTeamsTable();

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

function LastPageButton() {
  const { table } = useTeamsTable();

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

function PageSizeSelect() {
  const { table } = useTeamsTable();

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

export const TeamsTable = {
  useTeamsTable,
  Content,
  Root,
  NextButton,
  PrevButton,
  FirstPageButton,
  LastPageButton,
  PageSizeSelect,
};
