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
        <Suspense fallback={<TeamsListSectionSkeleton />}>
          <TeamsListSection orgSlug={orgSlug} />
        </Suspense>
      </TeamsFiltersProvider>
    </div>
  );
}
