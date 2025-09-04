import { PageHeader } from "@/core/shared/components/page-header";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

interface Props {
  businessId: string;
}

export function WithOutPermissionsCreateGroupScreen() {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader title="Nuevo Grupo" />
      <UserHasNoPermissionAlert />
    </section>
  );
}

export function CreateGroupScreen({ businessId }: Props) {
  return <div>{businessId}</div>;
}
