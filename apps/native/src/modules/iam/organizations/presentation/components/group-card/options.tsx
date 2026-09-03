import { MaterialIcons } from "@/modules/shared/components/icons";
import { useUpdateGroup } from "@fludge/client/application/iam/organization/mutations/use-group.mutations";
import type { GroupSummary } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { Link } from "expo-router";
import { Button } from "heroui-native/button";
import { Popover } from "heroui-native/popover";
import { Separator } from "heroui-native/separator";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  group: GroupSummary;
  asMemberGroup?: {
    onPress: (groupId: string, close: () => void) => void;
  };
}

export function GroupsOptions({ group, asMemberGroup }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
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
          <Popover.Title>{t("helpers.options")}</Popover.Title>

          <Button
            size="sm"
            onPress={close}
            isDisabled={isDisabled}
            className="flex justify-start"
          >
            <MaterialIcons name="info" size={20} className="text-eclipse" />
            <Button.Label>{t("helpers.view_details")}</Button.Label>
          </Button>

          <Link
            href={{
              pathname: "/(private)/dashboard/groups/[groupid]/update",
              params: { groupid: group.id },
            }}
            push
            asChild
          >
            <Button
              size="sm"
              onPress={close}
              isDisabled={isDisabled}
              className="flex justify-start"
            >
              <MaterialIcons name="edit" size={20} className="text-eclipse" />
              <Button.Label>{t("helpers.edit")}</Button.Label>
            </Button>
          </Link>

          {asMemberGroup === undefined && (
            <Button
              size="sm"
              onPress={toogleStatus}
              isDisabled={isDisabled}
              className="flex justify-start"
            >
              <MaterialIcons
                name="group-off"
                size={20}
                className="text-eclipse"
              />
              <Button.Label>
                 {t(
                   group.status === "active"
                     ? "helpers.status.deactivate"
                     : "helpers.status.activate"
                 )}
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
                className="text-eclipse"
              />
               <Button.Label>{t("helpers.unassign_group")}</Button.Label>
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
