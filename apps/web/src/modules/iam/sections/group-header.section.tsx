import { Calendar, ClockIcon, DotIcon, Edit2Icon } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale/es";
import type { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import {
  UpdateGroup,
  UpdateGroupProvider,
  useUpdateGroupForm,
} from "@/modules/iam/components/update-group";
import { Button } from "@fludge/ui/components/button";
import { AssignMembersToGroup } from "@/modules/iam/components/assign-members-to-group";

interface Props {
  organizationId: string;
  group: GroupDetail;
  canUpdate: boolean;
  canAssignMember: boolean;
}

function UpdateGroupButton({ group }: { group: GroupDetail }) {
  const { open } = useUpdateGroupForm();

  return (
    <Button
      onClick={() =>
        open({
          description: group.description || "",
          name: group.name,
          groupId: group.id,
          permissions: group.permissions,
        })
      }
    >
      <Edit2Icon />
      Editar Grupo
    </Button>
  );
}

export function GroupHeaderSection({
  group,
  organizationId,
  canUpdate,
  canAssignMember,
}: Props) {
  return (
    <header className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-4xl font-bold">{group.name}</h2>
          <p className="text-muted-foreground">{group.description || "-"}</p>
        </div>

        <div className="flex items-center gap-x-4">
          {canAssignMember && (
            <AssignMembersToGroup organizationId={organizationId} group={group} />
          )}
          {canUpdate && (
            <UpdateGroupProvider>
              <UpdateGroupButton group={group} />
              <UpdateGroup organizationId={organizationId} />
            </UpdateGroupProvider>
          )}
        </div>
      </div>
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-1">
          <Calendar className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            Creado el:{" "}
            {format(group.createdAt, "dd MMM yyyy", {
              locale: es,
            })}
          </p>
        </div>

        <DotIcon className="text-muted-foreground size-4" />
        <div className="flex items-center gap-x-1">
          <ClockIcon className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-sm">
            Ultima actualizacion:{" "}
            {formatDistance(group.updatedAt, new Date(), {
              locale: es,
            })}
          </p>
        </div>
      </div>
    </header>
  );
}
