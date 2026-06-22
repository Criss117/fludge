import { useEffect } from "react";
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
  fieldComponents: { UnassignedGroupsList, AssignedGroupsList },
  formComponents: {},
});

export const useMemberGroupForm = useAppForm;

export type GroupListItem = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  totalMembers: number;
};

type GroupListProps = {
  groups: GroupListItem[];
  isSelected: (groupId: string) => boolean;
  isAlreadySelected: (groupId: string) => boolean;
  onSelect: (groupId: string) => void;
};

type GroupListFieldProps = {
  groups: GroupListItem[];
  selectedGroupIds: string[];
  onSelectionChange?: (hasSelection: boolean) => void;
};

function UnassignedGroupsList({
  groups,
  selectedGroupIds,
  onSelectionChange,
}: GroupListFieldProps) {
  const field = useFieldContext<string[]>();

  const groupList = groups.filter(
    (group) => !selectedGroupIds.includes(group.id),
  );

  const isSelected = (groupId: string) => field.state.value.includes(groupId);

  const isAlreadySelected = (groupId: string) =>
    selectedGroupIds.includes(groupId);

  const onSelect = (groupId: string) =>
    field.setValue((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      }

      return [...prev, groupId];
    });

  useEffect(() => {
    onSelectionChange?.(field.state.value.length > 0);
  }, [field.state.value, onSelectionChange]);

  return (
    <GroupListField
      groups={groupList}
      isSelected={isSelected}
      isAlreadySelected={isAlreadySelected}
      onSelect={onSelect}
    />
  );
}

function AssignedGroupsList({ groups, selectedGroupIds, onSelectionChange }: GroupListFieldProps) {
  const field = useFieldContext<string[]>();

  const groupList = groups.filter((group) =>
    selectedGroupIds.includes(group.id),
  );

  const isSelected = (groupId: string) => !field.state.value.includes(groupId);

  const isAlreadySelected = (groupId: string) =>
    selectedGroupIds.includes(groupId);

  const onSelect = (groupId: string) =>
    field.setValue((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      }

      return [...prev, groupId];
    });

  useEffect(() => {
    onSelectionChange?.(field.state.value.length > 0);
  }, [field.state.value, onSelectionChange]);

  return (
    <GroupListField
      groups={groupList}
      isAlreadySelected={isAlreadySelected}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}

function GroupListField({
  groups,
  isSelected,
  onSelect,
  isAlreadySelected,
}: GroupListProps) {
  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No hay grupos disponibles.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {groups.map((group) => {
        const selected = isSelected(group.id);
        const alreadySelected = isAlreadySelected(group.id);

        return (
          <li key={group.id}>
            <Card
              className="cursor-pointer"
              onClick={() => onSelect(group.id)}
            >
              <CardHeader className="flex flex-row items-start gap-x-2 pb-2">
                <Checkbox
                  checked={selected}
                  onClick={() => onSelect(group.id)}
                />
                <div className="flex-1 min-w-0">
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>
                    {group.description || "Sin descripción"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge>
                  <span>{group.totalMembers} Miembros</span>
                </Badge>
                <div className="flex flex-wrap gap-1">
                  {group.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      <span>{permission}</span>
                    </Badge>
                  ))}
                </div>
                {(alreadySelected || (alreadySelected && !selected)) && (
                  <div className="flex flex-wrap gap-1">
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
                )}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
