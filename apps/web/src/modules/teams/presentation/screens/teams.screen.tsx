import { Suspense } from "react";

import { FiltersProvider } from "@shared/store/teams-filters.store";

import {
  TeamsHeaderSection,
  TeamsHeaderSectionSkeleton,
} from "@teams/presentation/sections/teams-header.section";
import {
  TeamsListSection,
  TeamsListSectionSkeleton,
} from "@teams/presentation/sections/teams-list.section";
import { UpdateTeam } from "@teams/presentation/components/update-team";
import type { TeamWithMembers } from "@teams/application/hooks/use-teams-queries";

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
