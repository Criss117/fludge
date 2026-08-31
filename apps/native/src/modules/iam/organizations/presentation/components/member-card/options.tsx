import { MaterialIcons } from "@/modules/shared/components/icons";
import type { MemberSummary } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Link } from "expo-router";
import { Button } from "heroui-native/button";
import { Popover } from "heroui-native/popover";
import { Separator } from "heroui-native/separator";
import { useState } from "react";

interface Props {
  member: MemberSummary;
  asGroupMember?: {
    onPress: (memberId: string, close: () => void) => void;
  };
}

export function MemberOptions({ member, asGroupMember }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  const onPressAsGroupMember = () => asGroupMember?.onPress(member.id, close);

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button isIconOnly variant="ghost">
          <MaterialIcons
            name="more-vert"
            size={24}
            className="text-foreground"
          />
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
          <Link
            href={{
              pathname: "/(private)/dashboard/members/[memberid]",
              params: { memberid: member.id },
            }}
            push
            asChild
          >
            <Button size="sm" onPress={close} className="flex justify-start">
              <MaterialIcons name="info" size={20} className="text-eclipse" />
              <Button.Label>Ver Detalles</Button.Label>
            </Button>
          </Link>

          <Separator />

          {asGroupMember && (
            <Button size="sm" onPress={onPressAsGroupMember}>
              <MaterialIcons
                name="group-off"
                size={20}
                className="text-eclipse"
              />
              <Button.Label>Desasignar Grupo</Button.Label>
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
