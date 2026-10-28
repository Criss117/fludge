import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { LinkFabButton } from "@/core/shared/components/link-fab-button";

import { CustomersList } from "./shared";

export function CustomersScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      <CustomersList searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <LinkFabButton
        action={{
          type: "push",
          href: "/dashboard/customers/create",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
