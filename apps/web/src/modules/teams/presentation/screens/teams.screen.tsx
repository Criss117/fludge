import { TeamsHeaderSection } from "../sections/teams-header.section";
import { TeamsListSection } from "../sections/teams-list.section";
import { TeamsFiltersProvider } from "@/modules/teams/application/store/teams-filters.store";

interface Props {
  orgSlug: string;
}

export function TeamsScreen({ orgSlug }: Props) {
  return (
    <div className="px-5 mt-4 space-y-5">
      <TeamsHeaderSection />
      <TeamsFiltersProvider>
        <TeamsListSection orgSlug={orgSlug} />
      </TeamsFiltersProvider>
    </div>
  );
}
