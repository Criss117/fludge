import { SalesScreen } from "@/modules/sales/presentation/screens/sales.screen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Sale() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <SalesScreen />
    </SafeAreaView>
  );
}
