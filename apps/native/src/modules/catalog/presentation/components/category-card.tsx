import { CategorySummary } from "@fludge/client/application/catalog/queries/use-find-categories";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { Card } from "heroui-native/card";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { View } from "react-native";
import { Popover } from "heroui-native/popover";
import { useState } from "react";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useTranslation } from "react-i18next";

export const CARD_HEIGHT = 120;

interface Props {
  category: CategorySummary;
  setSelectedCategory: (v: {
    category: CategorySummary;
    action: "edit" | "delete";
  }) => void;
}

function Options({ category, setSelectedCategory }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  const selectToUpdate = () => {
    closeMenu();
    setSelectedCategory({ category, action: "edit" });
  };
  const selectToDelete = () =>
    setSelectedCategory({ category, action: "delete" });

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
            onPress={selectToUpdate}
            className="flex justify-start"
          >
            <MaterialIcons name="edit" size={20} className="text-eclipse" />
            <Button.Label>{t("helpers.edit")}</Button.Label>
          </Button>

          <Button
            size="sm"
            className="flex justify-start"
            variant="danger-soft"
            onPress={selectToDelete}
          >
            <MaterialIcons name="delete" size={20} className="text-danger" />
            <Button.Label>{t("helpers.delete")}</Button.Label>
          </Button>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}

export function CategoryCard({ category, setSelectedCategory }: Props) {
  return (
    <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex-row items-start">
        <View className="flex-1">
          <Card.Title className="line-clamp-2">{category.name}</Card.Title>
          {category.description && (
            <Card.Description className="line-clamp-1">
              {category.description}
            </Card.Description>
          )}
        </View>
        <StatusChip status={category.status} />
        <Options
          category={category}
          setSelectedCategory={setSelectedCategory}
        />
      </Card.Header>
    </Card>
  );
}

export function CategoryCardSkeleton() {
  return (
    <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
      <SkeletonGroup className="gap-y-1 py-0.5">
        <Card.Header className="flex-row items-start">
          <View className="flex-1 gap-y-1">
            <SkeletonGroup.Item className="h-6 w-4/6 rounded-full" />
            <SkeletonGroup.Item className="h-4 w-5/6 rounded-full" />
          </View>
          <SkeletonGroup.Item className="h-7 w-1/4 rounded-full" />
        </Card.Header>
      </SkeletonGroup>
    </Card>
  );
}
