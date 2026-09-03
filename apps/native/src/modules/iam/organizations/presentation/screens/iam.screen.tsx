import { Tabs } from "heroui-native/tabs";
import { Suspense, useState } from "react";
import { View } from "react-native";
import {
  IamMembersSection,
  IamMembersSectionSkeleton,
} from "../sections/iam-members.section";
import { IamGroupsSection } from "../sections/iam-groups.section";
import { SearchInput } from "@/modules/shared/components/search-input";
import { FadeContentContainer } from "@/modules/shared/components/fade-container";
import { useTranslation } from "react-i18next";

export function IamScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("members");

  return (
    <View className="flex-1 gap-y-4 px-3">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder={
          tab === "groups"
            ? "helpers.placeholder.search_groups"
            : "helpers.placeholder.search_members"
        }
      />
      <Tabs value={tab} onValueChange={setTab} className="flex-1">
        <Tabs.List className="rounded-full">
          <Tabs.Indicator className="dark:bg-muted" />
          <Tabs.Trigger value="members" className="w-1/2">
            <Tabs.Label>{t("resources.members.name")}</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="groups" className="w-1/2">
            <Tabs.Label>{t("resources.groups.name")}</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="members" className="flex-1">
          <FadeContentContainer>
            <Suspense fallback={<IamMembersSectionSkeleton />}>
              <IamMembersSection query={query.trim()} />
            </Suspense>
          </FadeContentContainer>
        </Tabs.Content>
        <Tabs.Content value="groups" className="flex-1">
          <FadeContentContainer>
            <IamGroupsSection query={query.trim()} />
          </FadeContentContainer>
        </Tabs.Content>
      </Tabs>
    </View>
  );
}

export function IamScreenSkeleton() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 px-3">
      <Tabs value="members" onValueChange={() => {}} className="flex-1">
        <Tabs.List className="bg-muted rounded-full">
          <Tabs.ScrollView>
            <Tabs.Indicator />
            <Tabs.Trigger value="members" className="w-1/2" isDisabled>
              <Tabs.Label className="text-black dark:text-white">
                {t("resources.members.name")}
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="groups" className="w-1/2" isDisabled>
              <Tabs.Label className="text-black dark:text-white">
                {t("resources.groups.name")}
              </Tabs.Label>
            </Tabs.Trigger>
          </Tabs.ScrollView>
        </Tabs.List>
        <Tabs.Content value="members" className="flex-1">
          <IamMembersSectionSkeleton />
        </Tabs.Content>
      </Tabs>
    </View>
  );
}
