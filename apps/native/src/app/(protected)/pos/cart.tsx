import { useActiveTicket } from "@fludge/client/providers/ticket-store.provider";
import { Redirect } from "expo-router";

import { CartScreen } from "@/core/commerce/screens/cart";

export default function Cart() {
  const activeTicket = useActiveTicket();

  if (!activeTicket) return <Redirect href="/pos" />;

  return <CartScreen />;
}
