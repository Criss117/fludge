import { Tabs } from "heroui-native/tabs";
import { useState } from "react";
import { View } from "react-native";
import { IamMembersSection } from "../secttions/iam-members.section";
import { IamGroupsSection } from "../secttions/iam-groups.section";

export function IamScreen() {
  const [tab, setTab] = useState("members");

  return (
    <View className="flex-1 px-3">
      <Tabs value={tab} onValueChange={setTab} className="flex-1">
        <Tabs.List className="bg-muted rounded-full">
          <Tabs.ScrollView>
            <Tabs.Indicator />
            <Tabs.Trigger value="members" className="w-1/2">
              <Tabs.Label className="text-black dark:text-white">
                Miembros
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="groups" className="w-1/2">
              <Tabs.Label className="text-black dark:text-white">
                Grupos
              </Tabs.Label>
            </Tabs.Trigger>
          </Tabs.ScrollView>
        </Tabs.List>
        <Tabs.Content value="members" className="flex-1">
          <IamMembersSection />
        </Tabs.Content>
        <Tabs.Content value="groups" className="flex-1">
          <IamGroupsSection />
        </Tabs.Content>
      </Tabs>
    </View>
  );
}

export function IamScreenSkeleton() {
  return <></>;
}
