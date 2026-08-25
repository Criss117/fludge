import { Text, View } from "react-native";
import { Button } from "heroui-native/button";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useQuery } from "@tanstack/react-query";

export default function Index() {
  const orpc = useOrpc();
  const { session, signInEmail, signOut } = useAuth();
  const orgs = useQuery(orpc.organization.queries.findAll.queryOptions());

  return (
    <View>
      <Button
        onPress={() =>
          signInEmail.mutate({
            email: "root0@fludge.com",
            password: "holiwiss",
          })
        }
      >
        Sign In
      </Button>
      <Button onPress={() => signOut.mutate()}>Sign Out</Button>
      <Button
        onPress={() =>
          orgs.refetch().then((data) => {
            console.log(data);
          })
        }
      >
        Reload
      </Button>
      <Text>{JSON.stringify(orgs.data, null, 2)}</Text>
    </View>
  );
}
