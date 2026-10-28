import { Host, HStack, RNHostView, VStack } from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  cornerRadius,
  frame,
  onTapGesture,
  padding,
  shadow,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar } from "@/core/shared/components/avatar";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { LinkButton } from "@/core/shared/components/link-button/index";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useSelectOrganizationScreen } from "./use-select-organization-screen";

export function SelectOrganizationScreen() {
  const colors = useThemeColor();
  const { actions, state, texts } = useSelectOrganizationScreen();

  // return null;

  return (
    <ThemedView style={styles.container}>
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
          <Host key={org.id} matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <HStack
              modifiers={[
                background(colors.surfaceContainerHigh),
                cornerRadius(SPACING.md),
                shadow({ radius: 1, x: 0, y: 1, color: colors.secondary }),
                onTapGesture(() => actions.onSelect(org.id)),
              ]}
            >
              <HStack
                modifiers={[
                  frame({
                    maxWidth: Infinity,
                  }),
                  padding({
                    all: SPACING.md,
                  }),
                ]}
                alignment="top"
                spacing={SPACING.sm}
              >
                <RNHostView matchContents>
                  <Avatar name={org.name} />
                </RNHostView>
                <VStack
                  modifiers={[
                    frame({
                      maxWidth: Infinity,
                      alignment: "leading",
                    }),
                  ]}
                  alignment="leading"
                  spacing={SPACING.sm}
                >
                  <VStack alignment="leading">
                    <ThemedNativeText numberOfLines={1} variant="h6">
                      {org.name}
                    </ThemedNativeText>
                    <ThemedNativeText numberOfLines={1} variant="muted">
                      {org.legalName} - {org.taxId}
                    </ThemedNativeText>
                  </VStack>

                  <HStack>
                    <Icon name="location" size={18} />
                    <ThemedNativeText variant="base">{org.address}</ThemedNativeText>
                  </HStack>
                  <HStack>
                    <Icon name="phone" size={18} />
                    <ThemedNativeText variant="base">{org.phone}</ThemedNativeText>
                  </HStack>
                </VStack>
              </HStack>
            </HStack>
          </Host>
        ))}
      </ScrollView>

      {state.userIsRoot && (
        <View style={styles.footerContainer}>
          <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
            <LinkButton
              modifiers={[buttonStyle("borderedProminent"), tint(colors.onPrimaryContainer)]}
              action={{
                type: "replace",
                href: "/organization/register",
              }}
            >
              <HStack
                modifiers={[
                  frame({
                    maxWidth: Infinity,
                  }),
                ]}
              >
                <Icon name="save" size={18} color={colors.primaryContainer} />
                <ThemedNativeText color={colors.primaryContainer}>
                  {texts.toRegister}
                </ThemedNativeText>
              </HStack>
            </LinkButton>
          </Host>
        </View>
      )}
      <KeyboardSpacerView />
    </ThemedView>
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
    paddingTop: SPACING.md,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pressableCard: {
    borderRadius: SPACING.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});
