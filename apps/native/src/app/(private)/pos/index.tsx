import { POSScreen } from "@/modules/sales/presentation/screens/pos.screen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Sale() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <POSScreen />
    </SafeAreaView>
  );
}
