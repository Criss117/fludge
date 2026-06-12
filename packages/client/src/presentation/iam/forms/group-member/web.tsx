import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { Badge } from "@fludge/ui/components/badge";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Checkbox } from "@fludge/ui/components/checkbox";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { UnassignedMembersList, AssignedMembersList },
  formComponents: {},
});

export const useGroupMemberForm = useAppForm;

type MemberList = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  totalGroups: number;
};

type MemberListProps = {
  members: MemberList[];
  isSelected: (memberId: string) => boolean;
  isAlreadySelected: (memberId: string) => boolean;
  onSelect: (memberId: string) => void;
};

type MemberListFieldProps = {
  members: MemberList[];
  selectedMemberIds: string[];
};

function UnassignedMembersList({
  members,
  selectedMemberIds,
}: MemberListFieldProps) {
  const field = useFieldContext<string[]>();

  const memberList = members.filter(
    (member) => !selectedMemberIds.includes(member.id),
  );

  const isSelected = (memberId: string) => field.state.value.includes(memberId);

  const isAlreadySelected = (memberId: string) =>
    selectedMemberIds.includes(memberId);

  const onSelect = (memberId: string) =>
    field.setValue((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }

      return [...prev, memberId];
    });

  return (
    <MemberListField
      members={memberList}
      isSelected={isSelected}
      isAlreadySelected={isAlreadySelected}
      onSelect={onSelect}
    />
  );
}

function AssignedMembersList({
  members,
  selectedMemberIds,
}: MemberListFieldProps) {
  const field = useFieldContext<string[]>();

  const memberList = members.filter((member) =>
    selectedMemberIds.includes(member.id),
  );

  const isSelected = (memberId: string) =>
    !field.state.value.includes(memberId);

  const isAlreadySelected = (memberId: string) =>
    selectedMemberIds.includes(memberId);

  const onSelect = (memberId: string) =>
    field.setValue((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }

      return [...prev, memberId];
    });

  return (
    <MemberListField
      members={memberList}
      isAlreadySelected={isAlreadySelected}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}

function MemberListField({
  members,
  isSelected,
  onSelect,
  isAlreadySelected,
}: MemberListProps) {
  if (!members.length) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No hay miembros disponibles.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {members.map((member) => {
        const selected = isSelected(member.id);
        const alreadySelected = isAlreadySelected(member.id);

        return (
          <li key={member.id}>
            <Card
              className="flex flex-row justify-between cursor-pointer"
              onClick={() => onSelect(member.id)}
            >
              <CardHeader className="flex flex-row items-center gap-x-2">
                <Checkbox
                  checked={selected}
                  onClick={() => onSelect(member.id)}
                />
                <div>
                  <CardTitle>{member.user.name}</CardTitle>
                  <CardDescription>{member.user.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-end gap-y-2">
                <div className="space-x-1">
                  {alreadySelected && (
                    <Badge variant="outline">
                      <span>Ya está asignado</span>
                    </Badge>
                  )}
                  {alreadySelected && !selected && (
                    <Badge variant="destructive">
                      <span>Se eliminará del grupo</span>
                    </Badge>
                  )}
                </div>
                <Badge>
                  <span>{member.totalGroups} Grupos</span>
                </Badge>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
