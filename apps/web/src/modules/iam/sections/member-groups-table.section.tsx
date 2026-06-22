import { useMemo } from "react";
import type { MemberGroup } from "@fludge/client/application/iam/hooks/use-find-members";
import { useMemberGroupsTable } from "@fludge/client/application/iam/hooks/use-table";
import { memberGroupsTableColumns } from "@fludge/client/presentation/iam/tables/member-groups/columns";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";
import { BaseTable } from "@fludge/client/presentation/shared/tables/base-table.web";
import {
  PageSize,
  FirstPage,
  PrevPage,
  NextPage,
  LastPage,
} from "@fludge/client/presentation/shared/tables/pagination.web";
import { Link } from "@tanstack/react-router";
import { Button } from "@fludge/ui/components/button";

interface Props {
  groups: MemberGroup[];
}

export function MemberGroupsTableSection({ groups }: Props) {
  const { filters } = useFilters();

  const filtered = useMemo(() => {
    const query = filters.query?.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(query));
  }, [groups, filters.query]);

  const columns = memberGroupsTableColumns({
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

  const table = useMemberGroupsTable({
    data: filtered,
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
            <div className="text-center">
              Este miembro no pertenece a ningún grupo
            </div>
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