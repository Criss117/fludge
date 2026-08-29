import { MaterialIcons } from "@/modules/shared/components/icons";
import type { Member } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Link } from "expo-router";
import { Button } from "heroui-native/button";
import { Popover } from "heroui-native/popover";
import { Separator } from "heroui-native/separator";
import { useState } from "react";

interface Props {
  member: Member;
}

export function MemberOptions({ member }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

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
          <Link
            href={{
              pathname: "/(private)/dashboard/members/[memberid]",
              params: { memberid: member.id },
            }}
            push
            asChild
          >
            <Button size="sm" onPress={close}>
              <MaterialIcons
                name="info"
                size={20}
                className="text-white dark:text-black"
              />
              <Button.Label>Ver Detalles</Button.Label>
            </Button>
          </Link>

          <Separator />
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
