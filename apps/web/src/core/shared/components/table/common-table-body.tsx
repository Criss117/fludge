import { flexRender, type Table } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "../ui/table";

interface Props<T> {
  table: Table<T>;
  emptyMessage?: string;
  colSpan: number;
}

export function CommonTableBody<T>({ table, colSpan, emptyMessage }: Props<T>) {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={colSpan} className="h-24 text-center">
            {emptyMessage ?? "No hay registros"}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
