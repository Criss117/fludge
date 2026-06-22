import { useRef, useState, useCallback } from "react";
import { LayersIcon } from "lucide-react";
import type { MemberWithGroups } from "@fludge/client/application/iam/hooks/use-find-members";
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
  useAssignGroupsToMemberFormOptions,
  useUnAssignGroupsToMemberFormOptions,
} from "@fludge/client/application/iam/forms/group-members.form";
import {
  useMemberGroupForm,
  type GroupListItem,
} from "@fludge/client/presentation/iam/forms/member-group/web";
import { useFindAllGroups } from "@fludge/client/application/iam/hooks/use-find-groups";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@fludge/ui/components/field";

interface Props {
  organizationId: string;
  member: MemberWithGroups;
}

interface FormsProps {
  formRef: React.RefObject<HTMLFormElement | null>;
  organizationId: string;
  memberId: string;
  selectedGroupIds: string[];
  groupList: GroupListItem[];
  onSelectionChange?: (hasSelection: boolean) => void;
}

function UnAssignGroupsFromMemberForm({
  organizationId,
  groupList,
  memberId,
  selectedGroupIds,
  formRef,
  onSelectionChange,
}: FormsProps) {
  const formOptions = useUnAssignGroupsToMemberFormOptions({
    organizationId,
    memberId,
  });

  const form = useMemberGroupForm(formOptions);
  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldLegend>Grupos asignados</FieldLegend>
        <FieldDescription>
          Desmarca los grupos que deseas eliminar.
        </FieldDescription>
        <FieldGroup>
          <form.AppField name="groupIds">
            {(field) => (
              <field.AssignedGroupsList
                groups={groupList}
                selectedGroupIds={selectedGroupIds}
                onSelectionChange={onSelectionChange}
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

function AssignGroupsToMemberForm({
  organizationId,
  groupList,
  memberId,
  selectedGroupIds,
  formRef,
  onSelectionChange,
}: FormsProps) {
  const formOptions = useAssignGroupsToMemberFormOptions({
    organizationId,
    memberId,
  });

  const form = useMemberGroupForm(formOptions);
  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldLegend>Grupos disponibles</FieldLegend>
        <FieldDescription>
          Selecciona los grupos que deseas asignar.
        </FieldDescription>
        <FieldGroup>
          <form.AppField name="groupIds">
            {(field) => (
              <field.UnassignedGroupsList
                groups={groupList}
                selectedGroupIds={selectedGroupIds}
                onSelectionChange={onSelectionChange}
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

export function AssignGroupsToMember({ organizationId, member }: Props) {
  const assignGroupsFormRef = useRef<HTMLFormElement>(null);
  const unAssignGroupsFormRef = useRef<HTMLFormElement>(null);
  const { data: allGroups } = useFindAllGroups(organizationId);
  const [open, setOpen] = useState(false);
  const [hasAssignChanges, setHasAssignChanges] = useState(false);
  const [hasUnassignChanges, setHasUnassignChanges] = useState(false);

  const selectedGroupIds = member.groups.map((g) => g.id);
  const groupList: GroupListItem[] = allGroups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    permissions: group.permissions,
    totalMembers: group.members[0]?.total ?? 0,
  }));

  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open);
    if (!open) {
      setHasAssignChanges(false);
      setHasUnassignChanges(false);
    }
  }, []);

  const hasChanges = hasAssignChanges || hasUnassignChanges;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={(props) => <Button {...props} />}>
        <LayersIcon />
        <span>Asignar Grupos</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:min-w-[40dvw]">
        <SheetHeader>
          <SheetTitle className="text-xl">Asignar Grupos</SheetTitle>
          <SheetDescription>
            Asignar grupos a este miembro.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="p-4 no-scrollbar overflow-y-auto space-y-8">
          <UnAssignGroupsFromMemberForm
            formRef={unAssignGroupsFormRef}
            groupList={groupList}
            organizationId={organizationId}
            memberId={member.id}
            selectedGroupIds={selectedGroupIds}
            onSelectionChange={setHasUnassignChanges}
          />

          <AssignGroupsToMemberForm
            formRef={assignGroupsFormRef}
            groupList={groupList}
            organizationId={organizationId}
            memberId={member.id}
            selectedGroupIds={selectedGroupIds}
            onSelectionChange={setHasAssignChanges}
          />
        </div>
        <SheetFooter>
          <Button
            type="submit"
            disabled={!hasChanges}
            onClick={() => {
              assignGroupsFormRef.current?.requestSubmit();
              unAssignGroupsFormRef.current?.requestSubmit();
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