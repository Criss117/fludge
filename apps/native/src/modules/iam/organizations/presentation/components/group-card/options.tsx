import { MaterialIcons } from "@/modules/shared/components/icons";
import { useUpdateGroup } from "@fludge/client/application/iam/organization/mutations/use-group.mutations";
import type { GroupSummary } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { Button } from "heroui-native/button";
import { Popover } from "heroui-native/popover";
import { Separator } from "heroui-native/separator";
import { useState } from "react";

interface Props {
  group: GroupSummary;
  asMemberGroup?: {
    onPress: (groupId: string, close: () => void) => void;
  };
}

export function GroupsOptions({ group, asMemberGroup }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const updateGroup = useUpdateGroup();

  const close = () => setIsOpen(false);

  const onPressAsMemberGroup = () => asMemberGroup?.onPress(group.id, close);

  const toogleStatus = () => {
    if (asMemberGroup) return;

    updateGroup.mutate({
      id: group.id,
      status: group.status === "active" ? "inactive" : "active",
    });
  };

  const isDisabled = updateGroup.isPending;

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button isIconOnly variant="ghost">
          <MaterialIcons name="more-vert" size={24} className="text-accent" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Overlay className="bg-black/50" />
        <Popover.Content
          presentation="popover"
          width="content-fit"
          className="gap-1 rounded-xl px-6 py-4"
        >
          <Popover.Arrow />
          <Popover.Close className="absolute top-3 right-3 z-50" />
          <Popover.Title>Opciones</Popover.Title>

          <Button size="sm" onPress={close} isDisabled={isDisabled}>
            <MaterialIcons
              name="info"
              size={20}
              className="text-white dark:text-black"
            />
            <Button.Label>Ver Detalles</Button.Label>
          </Button>

          <Button size="sm" onPress={close} isDisabled={isDisabled}>
            <MaterialIcons
              name="edit"
              size={20}
              className="text-white dark:text-black"
            />
            <Button.Label>Editar</Button.Label>
          </Button>

          {asMemberGroup === undefined && (
            <Button size="sm" onPress={toogleStatus} isDisabled={isDisabled}>
              <MaterialIcons
                name="group-off"
                size={20}
                className="text-white dark:text-black"
              />
              <Button.Label>
                {group.status === "active" ? "Desactivar" : "Activar"}
              </Button.Label>
            </Button>
          )}
          <Separator />

          {asMemberGroup && (
            <Button
              size="sm"
              onPress={onPressAsMemberGroup}
              isDisabled={isDisabled}
            >
              <MaterialIcons
                name="group-off"
                size={20}
                className="text-white dark:text-black"
              />
              <Button.Label>Desasignar Grupo</Button.Label>
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
