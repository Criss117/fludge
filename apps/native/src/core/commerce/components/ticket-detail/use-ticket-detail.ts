import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import { useState } from "react";

import type { EditPresentationProps } from "./types";

export function useEditPresentation({ presentation, itemId }: EditPresentationProps) {
  const [isPresented, setIsPresented] = useState(false);
  const updatePresentation = useTicketStore((s) => s.updatePresentation);

  const open = () => setIsPresented(true);
  const close = () => setIsPresented(false);

  const handleUpdatePrice = (newPrice: number) => {
    updatePresentation({
      priceSale: newPrice,
      quantity: presentation.quantity,
      ticketItemId: itemId,
      ticketPresentationId: presentation.id,
    });
    close();
  };

  return {
    actions: {
      open,
      close,
      handleUpdatePrice,
      setIsPresented,
    },
    state: {
      isPresented,
    },
  };
}
