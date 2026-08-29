import { Tabs } from "heroui-native/tabs";
import { Suspense, useState } from "react";
import { View } from "react-native";
import {
  IamMembersSection,
  IamMembersSectionSkeleton,
} from "../sections/iam-members.section";
import { IamGroupsSection } from "../sections/iam-groups.section";
import { Input } from "heroui-native/input";
import { MaterialIcons } from "@/modules/shared/components/icons";

export function IamScreen() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("members");

  return (
    <View className="flex-1 gap-y-4 px-3">
      <View className="relative w-full flex-row items-center">
        <Input
          value={query}
          onChangeText={setQuery}
          className="flex-1 px-10"
          placeholder={tab === "members" ? "Buscar miembros" : "Buscar grupos"}
        />
        <View className="absolute left-4" pointerEvents="none">
          <MaterialIcons size={20} name="search" className="text-muted" />
        </View>
      </View>
      <Tabs value={tab} onValueChange={setTab} className="flex-1">
        <Tabs.List className="rounded-full">
          <Tabs.ScrollView>
            <Tabs.Indicator className="dark:bg-muted" />
            <Tabs.Trigger value="members" className="w-1/2">
              <Tabs.Label>Miembros</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="groups" className="w-1/2">
              <Tabs.Label>Grupos</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.ScrollView>
        </Tabs.List>
        <Tabs.Content value="members" className="flex-1">
          <Suspense fallback={<IamMembersSectionSkeleton />}>
            <IamMembersSection query={query.trim()} />
          </Suspense>
        </Tabs.Content>
        <Tabs.Content value="groups" className="flex-1">
          <IamGroupsSection query={query.trim()} />
        </Tabs.Content>
      </Tabs>
    </View>
  );
}

export function IamScreenSkeleton() {
  return (
    <View className="flex-1 px-3">
      <Tabs value="members" onValueChange={() => {}} className="flex-1">
        <Tabs.List className="bg-muted rounded-full">
          <Tabs.ScrollView>
            <Tabs.Indicator />
            <Tabs.Trigger value="members" className="w-1/2" isDisabled>
              <Tabs.Label className="text-black dark:text-white">
                Miembros
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="groups" className="w-1/2" isDisabled>
              <Tabs.Label className="text-black dark:text-white">
                Grupos
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
