import { Suspense } from "react";
import {
  TeamsHeaderSection,
  TeamsHeaderSectionSkeleton,
} from "../sections/teams-header.section";
import {
  TeamsListSection,
  TeamsListSectionSkeleton,
} from "../sections/teams-list.section";
import { UpdateTeamDialog } from "../components/update-team-dialog";
import { FiltersProvider } from "@/modules/shared/store/teams-filters.store";

interface Props {
  orgSlug: string;
}

export function TeamsScreen({ orgSlug }: Props) {
  return (
    <div className="px-5 mt-4 space-y-5">
      <Suspense fallback={<TeamsHeaderSectionSkeleton />}>
        <TeamsHeaderSection />
      </Suspense>
      <UpdateTeamDialog.Root>
        <Suspense fallback={<TeamsListSectionSkeleton />}>
          <FiltersProvider>
            <TeamsListSection orgSlug={orgSlug} />
          </FiltersProvider>
        </Suspense>
        <UpdateTeamDialog.FormDialog />
      </UpdateTeamDialog.Root>
    </div>
  );
}
