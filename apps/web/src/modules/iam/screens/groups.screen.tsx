import { GroupsHeaderSection } from "@/modules/iam/sections/groups-header.section";

interface Props {
  organizationId: string;
}

export function GroupsScreen({ organizationId }: Props) {
  return (
    <div className="p-8">
      <GroupsHeaderSection organizationId={organizationId} />
    </div>
  );
}

export function GroupsScreenSkeleton() {
  return <div className="px-5">Loading...</div>;
}
