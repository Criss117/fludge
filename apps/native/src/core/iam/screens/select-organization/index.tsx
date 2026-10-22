import { Column, ElevatedCard, Host, RNHostView, Row, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, paddingAll, weight, width } from "@expo/ui/jetpack-compose/modifiers";
import { PressableScale } from "pressto";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/core/shared/components/avatar";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { LinkButton } from "@/core/shared/components/link-button";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useSelectOrganizationScreen } from "./use-select-organization-screen";

export function SelectOrganizationScreen() {
  const colors = useThemeColor();
  const { actions, state, texts } = useSelectOrganizationScreen();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <SearchInput
            onValueChange={actions.onChangeText}
            placeholder={texts.searchInput.placeholder}
            label={texts.searchInput.label}
          />
        </Host>
      </View>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {state.organizations.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText variant="muted">{texts.emptyList}</ThemedText>
          </View>
        )}
        {state.organizations.map((org) => (
          <PressableScale
            key={org.id}
            style={styles.pressableCard}
            onPress={() => actions.onSelect(org.id)}
          >
            <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
              <ElevatedCard
                modifiers={[fillMaxWidth()]}
                colors={{
                  containerColor: colors.secondaryContainer,
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
                      <ThemedNativeText numberOfLines={1} variant="h6">
                        {org.name}
                      </ThemedNativeText>
                      <ThemedNativeText numberOfLines={1} variant="muted">
                        {org.legalName} - {org.taxId}
                      </ThemedNativeText>
                    </Column>

                    <Row horizontalAlignment="center" verticalAlignment="center">
                      <Icon name="location-on" size={18} />
                      <Spacer modifiers={[width(SPACING.xs)]} />
                      <ThemedNativeText variant="base">{org.address}</ThemedNativeText>
                    </Row>
                    <Row horizontalAlignment="center" verticalAlignment="center">
                      <Icon name="call" size={18} />
                      <Spacer modifiers={[width(SPACING.xs)]} />
                      <ThemedNativeText variant="base">{org.phone}</ThemedNativeText>
                    </Row>
                  </Column>
                </Row>
              </ElevatedCard>
            </Host>
          </PressableScale>
        ))}
      </ScrollView>
      {state.userIsRoot && (
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
                {texts.toRegister}
              </ThemedNativeText>
            </LinkButton>
          </Host>
        </View>
      )}
      <KeyboardSpacerView />
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
  },
  listContentContainer: {
    flex: 1,
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
