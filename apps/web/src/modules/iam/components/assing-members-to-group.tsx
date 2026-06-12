import { useRef, useState } from "react";
import { UserPlusIcon } from "lucide-react";
import type { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import { Button } from "@fludge/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@fludge/ui/components/sheet";
import { Separator } from "@fludge/ui/components/separator";
import {
  useAssingMembersToGroupFormOptions,
  useUnAssingMembersToGroupFormOptions,
} from "@fludge/client/application/iam/forms/group-members.form";
import { useGroupMemberForm } from "@fludge/client/presentation/iam/forms/group-member/web";
import { useFindAllMembers } from "@fludge/client/application/iam/hooks/use-find-members";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@fludge/ui/components/field";

interface Props {
  organizationId: string;
  group: GroupDetail;
}

interface FormsProps {
  formRef: React.RefObject<HTMLFormElement | null>;
  organizationId: string;
  groupId: string;
  selectedMemberIds: string[];
  memberList: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    totalGroups: number;
  }[];
}

function UnAssignMembersToGroupForm({
  organizationId,
  memberList,
  groupId,
  selectedMemberIds,
  formRef,
}: FormsProps) {
  const formOptions = useUnAssingMembersToGroupFormOptions({
    organizationId,
    groupId: groupId,
  });

  const form = useGroupMemberForm(formOptions);
  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldLegend>Miembros de este grupo</FieldLegend>
        <FieldDescription>
          Desmarca los miembros que deseas eliminar.
        </FieldDescription>
        <FieldGroup>
          <form.AppField name="memberIds">
            {(field) => (
              <field.AssignedMembersList
                members={memberList}
                selectedMemberIds={selectedMemberIds}
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

function AssignMembersToGroupForm({
  organizationId,
  memberList,
  groupId,
  selectedMemberIds,
  formRef,
}: FormsProps) {
  const formOptions = useAssingMembersToGroupFormOptions({
    organizationId,
    groupId: groupId,
  });

  const form = useGroupMemberForm(formOptions);
  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldLegend>Miembros fuera de este grupo</FieldLegend>
        <FieldDescription>
          Selecciona los miembros que deseas asignar.
        </FieldDescription>
        <FieldGroup>
          <form.AppField name="memberIds">
            {(field) => (
              <field.UnassignedMembersList
                members={memberList}
                selectedMemberIds={selectedMemberIds}
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

export function AssignMembersToGroup({ organizationId, group }: Props) {
  const assignMembersFormRef = useRef<HTMLFormElement>(null);
  const unAssignMembersFormRef = useRef<HTMLFormElement>(null);
  const allMembers = useFindAllMembers(organizationId);
  const [open, setOpen] = useState(false);

  const selectedMemberIds = group.members.map((m) => m.id);
  const memberList = allMembers.map((member) => ({
    id: member.id,
    user: {
      name: member.user.name,
      email: member.user.email,
    },
    totalGroups: member.groups.length,
  }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={(props) => <Button {...props} />}>
        <UserPlusIcon />
        <span>Asignar Miembros</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:min-w-[40dvw]">
        <SheetHeader>
          <SheetTitle className="text-xl">Asignar Miembros</SheetTitle>
          <SheetDescription>Asignar miembros a este grupo.</SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="p-4 no-scrollbar overflow-y-auto space-y-8">
          <UnAssignMembersToGroupForm
            formRef={unAssignMembersFormRef}
            memberList={memberList}
            organizationId={organizationId}
            groupId={group.id}
            selectedMemberIds={selectedMemberIds}
          />

          <AssignMembersToGroupForm
            formRef={assignMembersFormRef}
            memberList={memberList}
            organizationId={organizationId}
            groupId={group.id}
            selectedMemberIds={selectedMemberIds}
          />
        </div>
        <SheetFooter>
          <Button
            type="submit"
            onClick={() => {
              assignMembersFormRef.current?.requestSubmit();
              unAssignMembersFormRef.current?.requestSubmit();
            }}
          >
            Guardar Cambios
          </Button>
          <SheetClose
            render={(props) => (
              <Button
                {...props}
                onClick={(e) => {
                  props.onClick?.(e);
                }}
                variant="outline"
              />
            )}
          >
            <span>Cancelar</span>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
