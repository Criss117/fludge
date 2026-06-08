import { useFindAllMembers } from "@fludge/client/application/iam/hooks/use-find-members";
import { useMembersTable } from "@fludge/client/application/iam/hooks/use-table";
import { membersTableColumns } from "@fludge/client/presentation/iam/tables/members/columns";
import { BaseTable } from "@fludge/client/presentation/shared/tables/base-table.web";
import { MembersTableActions } from "@fludge/client/presentation/iam/tables/members/actions.web";
import { MemberGroupsCell } from "@fludge/client/presentation/iam/tables/members/cells.web";
import {
  PageSize,
  FirstPage,
  PrevPage,
  NextPage,
  LastPage,
} from "@fludge/client/presentation/shared/tables/pagination.web";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";

interface Props {
  organizationId: string;
}

export function MembersTableSection({ organizationId }: Props) {
  const { filters } = useFilters();
  const { data: members } = useFindAllMembers(organizationId, {
    name: filters.query,
  });

  const columns = membersTableColumns({
    renderActions: (row) => <MembersTableActions row={row} />,
    groupsAssigned: (groups) => <MemberGroupsCell groups={groups} />,
  });

  const table = useMembersTable({ data: members, columns });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden  border">
        <BaseTable
          table={table}
          columnsLength={columns.length}
          EmptyComponent={
            <div className="text-center">No se encontraron miembros</div>
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
