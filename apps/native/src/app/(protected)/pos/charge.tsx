import { useActiveTicket } from "@fludge/client/providers/ticket-store.provider";
import { Redirect } from "expo-router";

import { ChargeSaleScreen } from "@/core/commerce/screens/charge";

export default function Charge() {
  const activeTicket = useActiveTicket();

  if (!activeTicket) return <Redirect href="/pos" />;

  return <ChargeSaleScreen />;
}
