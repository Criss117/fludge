import { Avatar } from "@/core/shared/components/avatar";
import { Icon } from "@/core/shared/components/icon";
import { LinkButton } from "@/core/shared/components/link-button";
import { TextInput } from "@/core/shared/components/text-input";
import {
  ThemedNativeText,
  ThemedText,
} from "@/core/shared/components/themed-text";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import {
  Column,
  ElevatedCard,
  Host,
  RNHostView,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  paddingAll,
  weight,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useAuth } from "@fludge/client/providers/auth.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import { useRouter } from "expo-router";
import { PressableScale } from "pressto";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

export function SelectOrganizationScreen() {
  const spacer = useKeyboardSpacer();
  const colors = useThemeColor();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { session } = useAuth();
  const { organizations, switchOrganization, activeOrganization } =
    useOrganization();

  const userIsRoot = !!session.data?.user.isRoot;

  const allOrganizations = useMemo(() => {
    if (!query) return organizations;

    return organizations.filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.taxId.toLowerCase().includes(query.toLowerCase()) ||
        d.legalName.toLowerCase().includes(query.toLowerCase()),
    );
  }, [organizations, query]);

  const onChangeText = (text: string) => setQuery(text.trim());

  const onPress = async (organizationId: string) => {
    if (switchOrganization.isPending) return;

    if (organizationId === activeOrganization?.id) {
      router.replace({
        pathname: "/dashboard",
      });

      return;
    }

    switchOrganization.mutate(organizationId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <TextInput
            onValueChange={onChangeText}
            modifiers={[fillMaxWidth()]}
            iconName="search"
            placeholder="screens.organization.select.search.placeholder"
            label="screens.organization.select.search.label"
          />
        </Host>
      </View>

      <ScrollView
        style={styles.listContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {allOrganizations.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText variant="muted">
              {t("screens.organization.select.no_organizations")}
            </ThemedText>
          </View>
        )}
        {allOrganizations.map((org) => (
          <PressableScale
            key={org.id}
            style={styles.pressableCard}
            onPress={() => onPress(org.id)}
          >
            <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
              <ElevatedCard
                modifiers={[fillMaxWidth()]}
                colors={{
                  containerColor: colors.onSecondary,
                }}
              >
                <Row
                  modifiers={[fillMaxWidth(), paddingAll(SPACING.md)]}
                  horizontalArrangement={{
                    spacedBy: SPACING.sm,
                  }}
                >
                  <RNHostView matchContents>
                    <Avatar name={org.name} />
                  </RNHostView>
                  <Column
                    modifiers={[weight(1)]}
                    verticalArrangement={{
                      spacedBy: SPACING.sm,
                    }}
                  >
                    <Column>
                      <ThemedNativeText maxLines={1} variant="h6">
                        {org.name}
                      </ThemedNativeText>
                      <ThemedNativeText maxLines={1} variant="muted">
                        {org.legalName} - {org.taxId}
                      </ThemedNativeText>
                    </Column>

                    <Row
                      horizontalAlignment="center"
                      verticalAlignment="center"
                    >
                      <Icon name="location-on" size={18} />
                      <Spacer modifiers={[width(SPACING.xs)]} />
                      <ThemedNativeText variant="base">
                        {org.address}
                      </ThemedNativeText>
                    </Row>
                    <Row
                      horizontalAlignment="center"
                      verticalAlignment="center"
                    >
                      <Icon name="call" size={18} />
                      <Spacer modifiers={[width(SPACING.xs)]} />
                      <ThemedNativeText variant="base">
                        {org.phone}
                      </ThemedNativeText>
                    </Row>
                  </Column>
                </Row>
              </ElevatedCard>
            </Host>
          </PressableScale>
        ))}
      </ScrollView>
      {userIsRoot && (
        <View style={styles.footerContainer}>
          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <LinkButton
              colors={{
                containerColor: colors.onPrimaryContainer,
              }}
              modifiers={[fillMaxWidth()]}
              action={{
                type: "replace",
                href: "/dashboard/organization/register",
              }}
            >
              <Icon name="add-business" size={20} />
              <Spacer modifiers={[width(SPACING.sm)]} />
              <ThemedNativeText color={colors.primaryContainer}>
                {t("helpers.register_organization")}
              </ThemedNativeText>
            </LinkButton>
          </Host>
          <ThemedText variant="muted" style={{ textAlign: "center" }}>
            {t("helpers.switch_organization_hint")}
          </ThemedText>
        </View>
      )}
      <Animated.View style={spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.lg,
  },
  headerContainer: {
    paddingHorizontal: SPACING.sm,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.md,
  },
  footerContainer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
    rowGap: SPACING.md,
  },
  pressableCard: {
    borderRadius: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
