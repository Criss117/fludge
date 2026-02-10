import { Button } from "@/modules/shared/components/ui/button";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { Skeleton } from "@/modules/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { TableSizes } from "@/modules/shared/lib/constants";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

const columnHelper = createColumnHelper<Team>();

const columns = [
  columnHelper.display({
    id: "selectors",
    header: () => {
      return <Checkbox disabled aria-label="Select all" />;
    },
    cell: () => {
      return <Checkbox disabled aria-label="Select row" />;
    },
  }),
  columnHelper.accessor((t) => t.name, {
    id: "name",
    header: () => (
      <div className="flex items-start">
        <p>Nombre del Equipo</p>
      </div>
    ),
  }),
  columnHelper.accessor((t) => t.description, {
    id: "description",
    header: "Descripción",
  }),
  columnHelper.display({
    id: "employees",
    header: "Número de Empleados",
  }),
  columnHelper.accessor((t) => t.permissions, {
    id: "permissions",
    header: "Permisos",
  }),

  columnHelper.accessor((t) => t.createdAt, {
    id: "created_at",
    header: "Fecha de creación",
  }),
  columnHelper.display({
    id: "actions",
  }),
];

function Content() {
  const table = useReactTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Skeleton className="h-full w-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function NextButton() {
  return (
    <Button size="icon-sm" variant="outline" disabled>
      <ChevronRightIcon />
    </Button>
  );
}

function PrevButton() {
  return (
    <Button size="icon-sm" disabled variant="outline">
      <ChevronLeftIcon />
    </Button>
  );
}

function FirstPageButton() {
  return (
    <Button size="icon-sm" variant="outline" disabled>
      <ChevronsLeftIcon />
    </Button>
  );
}

function LastPageButton() {
  return (
    <Button size="icon-sm" variant="outline" disabled>
      <ChevronsRightIcon />
    </Button>
  );
}

function PageSizeSelect() {
  return (
    <Select items={TableSizes} defaultValue="10">
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger>
        <SelectGroup>
          {TableSizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              <span>{size.label}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export const TeamsTableSkeleton = {
  NextButton,
  PrevButton,
  FirstPageButton,
  LastPageButton,
  PageSizeSelect,
  Content,
};
