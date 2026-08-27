import { useFindActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { Typography } from "heroui-native/text";
import { ScrollView } from "react-native";

export function IamGroupsSection() {
  const { data: activeOrganization } = useFindActiveOrganization();

  return (
    <ScrollView>
      <Typography.Code>
        {JSON.stringify(activeOrganization.groups, null, 2)}
      </Typography.Code>
    </ScrollView>
  );
}
