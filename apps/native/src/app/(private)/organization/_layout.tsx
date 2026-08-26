import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";

export default function OrganizationLayout() {
  const orpc = useOrpc();
  const { data } = useSuspenseQuery(
    orpc.organization.queries.findAll.queryOptions()
  );

  const userHasOrganizations = data?.length > 0;

  return (
    <Stack>
      <Stack.Protected guard={!userHasOrganizations}>
        <Stack.Screen name="index" />
      </Stack.Protected>

      <Stack.Protected guard={userHasOrganizations}>
        <Stack.Screen name="select" />
      </Stack.Protected>
    </Stack>
  );
}
