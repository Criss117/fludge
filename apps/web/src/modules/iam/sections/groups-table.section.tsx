import { useFindAllGroups } from "@fludge/client/application/iam/hooks/use-find-groups";
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

interface Props {
  organizationId: string;
}

export function GroupsTableSection({ organizationId }: Props) {
  const { filters } = useFilters();
  const { open } = useUpdateGroupForm();

  const { data: groups } = useFindAllGroups(organizationId, {
    name: filters.query,
  });

  const columns = groupsTableColumns({
    renderActions: (row) => (
      <GroupsTableActions
        row={row}
        onUpdateClick={() =>
          open({
            permissions: row.permissions,
            groupId: row.id,
            name: row.name,
            description: row.description || "",
          })
        }
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

export function GroupsTableSectionSkeleton() {
  return null;
}
