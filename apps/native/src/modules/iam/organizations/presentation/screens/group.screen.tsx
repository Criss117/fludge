import type { GroupSummary } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { Link } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Skeleton } from "heroui-native/skeleton";
import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { GroupMembersSection } from "../sections/group-members.section";
import { GroupPermissionsSection } from "../sections/group-permissions.section";
import { useTranslation } from "react-i18next";

export function GroupScreen({ group }: { group: GroupSummary }) {
  const [tab, setTab] = useState("members");
  const { t } = useTranslation();

  return (
    <View className="mt-2 flex-1 px-3">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-y-6 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Card.Header className="gap-y-2">
            <View className="flex-row items-center gap-x-3">
              <MaterialIcons
                name="groups"
                size={36}
                className="text-foreground"
              />
              <View className="flex-1 gap-y-1">
                <Card.Title>{group.name}</Card.Title>
                <StatusChip status={group.status} />
              </View>
            </View>
            <Card.Description>{group.description}</Card.Description>
          </Card.Header>
          <Card.Footer className="flex-row items-center justify-between">
            <Typography color="muted">
              {t("helpers.created_at")}: {group.createdAt.toLocaleDateString()}
            </Typography>
            <View className="flex-row items-center gap-x-1">
              <MaterialIcons name="people" size={20} className="text-muted" />
              <Typography color="muted">{group.members.length}</Typography>
            </View>
          </Card.Footer>
        </Card>

        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <Tabs.List className="rounded-full">
            <Tabs.ScrollView>
              <Tabs.Indicator className="dark:bg-muted" />
              <Tabs.Trigger value="members" className="w-1/2">
                <Tabs.Label>{t("screens.members.title")}</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="permissions" className="w-1/2">
                <Tabs.Label>{t("resources.permissions.name")}</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.ScrollView>
          </Tabs.List>
          <Tabs.Content value="members" className="flex-1">
            <GroupMembersSection groupId={group.id} />
          </Tabs.Content>
          <Tabs.Content value="permissions" className="flex-1">
            <GroupPermissionsSection group={group} />
          </Tabs.Content>
        </Tabs>
      </ScrollView>

      <View className="pt-2 pb-4">
        <Link
          href={{
            pathname: "/(private)/dashboard/groups/[groupid]/assign-members",
            params: { groupid: group.id },
          }}
          push
          asChild
        >
          <Button>
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              className="text-eclipse"
            />
            <Button.Label>{t("inputs.member.assign_groups")}</Button.Label>
          </Button>
        </Link>
      </View>
    </View>
  );
}

export function GroupScreenSkeleton() {
  const { t } = useTranslation();
  return (
    <View className="mt-2 flex-1 gap-y-6 px-3">
      <Card>
        <Card.Header className="gap-y-2">
          <Skeleton className="h-8 w-2/3 rounded-full" />
          <Skeleton className="h-6 w-1/2 rounded-full" />
        </Card.Header>
      </Card>
      <Tabs value="members" onValueChange={() => {}} className="flex-1">
        <Tabs.List className="rounded-full">
          <Tabs.ScrollView>
            <Tabs.Indicator />
            <Tabs.Trigger value="members" className="w-1/2" isDisabled>
              <Tabs.Label>{t("resources.members.name")}</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="permissions" className="w-1/2" isDisabled>
              <Tabs.Label>{t("resources.permissions.name")}</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.ScrollView>
        </Tabs.List>
      </Tabs>
    </View>
  );
}
