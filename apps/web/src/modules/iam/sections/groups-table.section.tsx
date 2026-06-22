import { useFindAllGroups } from "@fludge/client/application/iam/hooks/use-find-groups";
import { useGroupActionsMutations } from "@fludge/client/application/iam/forms/group-actions";
import { useGroupsTable } from "@fludge/client/application/iam/hooks/use-table";
import { groupsTableColumns } from "@fludge/client/presentation/iam/tables/groups/columns";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";
import { BaseTable } from "@fludge/client/presentation/shared/tables/base-table.web";
import { GroupsTableActions } from "@fludge/client/presentation/iam/tables/groups/actions.web";
import {
  PageSize,
  FirstPage,
  PrevPage,
  NextPage,
  LastPage,
} from "@fludge/client/presentation/shared/tables/pagination.web";
import { useUpdateGroupForm } from "@/modules/iam/components/update-group";
import { Link } from "@tanstack/react-router";
import { Button } from "@fludge/ui/components/button";
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

export function GroupsTableSection({ organizationId, canUpdate, canDelete }: Props) {
  const { filters } = useFilters();
  const { open } = useUpdateGroupForm();
  const { deleteGroup, activateGroup, deactivateGroup } =
    useGroupActionsMutations({ organizationId });

  const { data: groups } = useFindAllGroups(organizationId, {
    name: filters.query,
  });

  const columns = groupsTableColumns({
    renderActions: (row) => (
      <GroupsTableActions
        row={row}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onUpdateClick={() =>
          open({
            permissions: row.permissions,
            groupId: row.id,
            name: row.name,
            description: row.description || "",
          })
        }
        onDeleteClick={(group) => deleteGroup(group)}
        onActivateClick={(group) => activateGroup(group)}
        onDeactivateClick={(group) => deactivateGroup(group)}
      />
    ),
    nameCell: (row) => (
      <Button
        variant="link"
        className="text-base"
        nativeButton={false}
        render={(props) => (
          <Link to="/groups/$slug" params={{ slug: row.slug }} {...props} />
        )}
      >
        {row.name}
      </Button>
    ),
  });

  const table = useGroupsTable({
    data: groups,
    columns: columns,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden  border">
        <BaseTable
          table={table}
          columnsLength={columns.length}
          EmptyComponent={
            <div className="text-center">No se encontraron grupos</div>
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

const GROUPS_TABLE_HEADERS = [
  "Nombre",
  "Miembros",
  "Permisos",
  "Última Actualización",
  "Creado Por",
  "Acciones",
];

const SKELETON_ROWS = Array.from({ length: 5 });

export function GroupsTableSectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden border">
        <Table>
          <TableHeader className="bg-card">
            <TableRow>
              {GROUPS_TABLE_HEADERS.map((header) => (
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
                  <Skeleton className="h-4 w-10" />
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
