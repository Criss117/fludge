import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { CustomersList } from "./shared";

export function CustomersScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      <CustomersList searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
