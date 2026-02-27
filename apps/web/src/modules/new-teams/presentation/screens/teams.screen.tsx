import type { TeamWithMembers } from "@/modules/new-teams/application/hooks/use-teams-queries";
import { Suspense } from "react";
import {
  TeamsHeaderSection,
  TeamsHeaderSectionSkeleton,
} from "../sections/teams-header.section";
import { FiltersProvider } from "@/modules/shared/store/teams-filters.store";
import {
  TeamsListSection,
  TeamsListSectionSkeleton,
} from "../sections/teams-list.section";
import { UpdateTeam } from "../components/update-team";

interface Props {
  teams: TeamWithMembers[];
}

export function TeamsScreen({ teams }: Props) {
  const totalTeams = teams.length;

  return (
    <div className="px-5 mt-4 space-y-5">
      <Suspense fallback={<TeamsHeaderSectionSkeleton />}>
        <TeamsHeaderSection totalTeams={totalTeams} />
      </Suspense>
      <UpdateTeam.Root>
        <Suspense fallback={<TeamsListSectionSkeleton />}>
          <FiltersProvider>
            <TeamsListSection teams={teams} />
          </FiltersProvider>
        </Suspense>
        <UpdateTeam.FormDialog />
      </UpdateTeam.Root>
    </div>
  );
}
