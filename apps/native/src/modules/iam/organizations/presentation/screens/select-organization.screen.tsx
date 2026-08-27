import { useFindAllOrganizations } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { FlatList, View } from "react-native";
import { CARD_HEIGHT, OrganizationCard } from "../components/organization-card";
import { useMemo, useState } from "react";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { Input } from "heroui-native/input";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Link, useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

const ITEM_SEPARATOR_HEIGHT = 16;

export function SelectOrganizationScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { setActiveOrganization, session } = useAuth();
  const { data } = useFindAllOrganizations();

  const userIsRoot = !!session.data?.user.isRoot;

  const allOrganizations = useMemo(() => {
    if (!query) return data;

    return data.filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.taxId.toLowerCase().includes(query.toLowerCase()) ||
        d.legalName.toLowerCase().includes(query.toLowerCase())
    );
  }, [data, query]);

  const onChangeText = (text: string) => setQuery(text.trim());

  const onPress = (organizationId: string) => {
    setActiveOrganization.mutate(
      { organizationId },
      {
        onSuccess: () => {
          router.replace({
            pathname: "/(private)/dashboard/(tabs)",
          });
        },
      }
    );
  };

  return (
    <View className="flex-1 gap-y-5">
      <View className="relative w-full flex-row items-center px-3">
        <Input
          value={query}
          onChangeText={onChangeText}
          className="flex-1 px-10"
          placeholder="Buscar por nombre o Tax ID / NIT"
        />
        <View className="absolute left-6" pointerEvents="none">
          <MaterialIcons size={20} name="search" className="text-muted" />
        </View>
      </View>

      <FlatList
        data={allOrganizations}
        className="flex-1 px-3"
        contentContainerStyle={{ paddingBottom: userIsRoot ? 8 : 32 }}
        style={{ paddingBottom: 0 }}
        keyExtractor={(d) => d.id}
        ItemSeparatorComponent={
          <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrganizationCard
            organization={item}
            isPending={setActiveOrganization.isPending}
            onPress={onPress}
          />
        )}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT,
          offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
          index,
        })}
      />

      {userIsRoot && (
        <View className="gap-y-2 px-3">
          <Link
            href="/(private)/organization"
            replace
            asChild
            disabled={setActiveOrganization.isPending}
          >
            <Button isDisabled={setActiveOrganization.isPending}>
              <MaterialIcons
                name="add-business"
                size={20}
                className="text-white dark:text-black"
              />
              <Button.Label>Registrar Nueva Organización</Button.Label>
            </Button>
          </Link>
          <Typography type="body-sm" color="muted" align="center">
            Puedes cambiar de organización en cualquier momento desde los
            ajustes
          </Typography>
        </View>
      )}
    </View>
  );
}

export function SelectOrganizationScreenSkeleton() {
  return <></>;
}
