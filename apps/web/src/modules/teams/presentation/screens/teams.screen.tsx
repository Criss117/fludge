import { Suspense } from "react";
import {
  TeamsHeaderSection,
  TeamsHeaderSectionSkeleton,
} from "../sections/teams-header.section";
import {
  TeamsListSection,
  TeamsListSectionSkeleton,
} from "../sections/teams-list.section";
import { TeamsFiltersProvider } from "@/modules/teams/application/store/teams-filters.store";
import { UpdateTeamDialog } from "../components/update-team-dialog";

interface Props {
  orgSlug: string;
}

export function TeamsScreen({ orgSlug }: Props) {
  return (
    <div className="px-5 mt-4 space-y-5">
      <Suspense fallback={<TeamsHeaderSectionSkeleton />}>
        <TeamsHeaderSection />
      </Suspense>
      <TeamsFiltersProvider>
        <UpdateTeamDialog.Root>
          <Suspense fallback={<TeamsListSectionSkeleton />}>
            <TeamsListSection orgSlug={orgSlug} />
          </Suspense>
          <UpdateTeamDialog.FormDialog />
        </UpdateTeamDialog.Root>
      </TeamsFiltersProvider>
    </div>
  );
}
