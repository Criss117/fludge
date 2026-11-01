import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";

import type { TicketDetailItemProps } from "./types";

export function useTicketDetail({ itemId, presentation }: TicketDetailItemProps) {
  const updatePresentation = useTicketStore((s) => s.updatePresentation);
  const removePresentations = useTicketStore((s) => s.removePresentations);

  const handleRemovePresentation = () => {
    removePresentations([presentation.id]);
  };

  const handleUpdateQuantity = (quantity: number) => {
    updatePresentation({
      priceSale: presentation.priceSale,
      quantity,
      ticketItemId: itemId,
      ticketPresentationId: presentation.id,
    });
  };

  const increaseQuantity = () => {
    handleUpdateQuantity(presentation.quantity + 1);
  };

  const decreaseQuantity = () => {
    const nextQuantity = presentation.quantity - 1;

    if (nextQuantity <= 0) {
      handleRemovePresentation();
      return;
    }

    handleUpdateQuantity(nextQuantity);
  };

  return {
    actions: {
      decreaseQuantity,
      increaseQuantity,
    },
  };
}
