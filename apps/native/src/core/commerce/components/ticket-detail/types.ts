import type { TicketProduct } from "@fludge/client/commerce/domain/local-ticket.repository";

export interface TicketDetailItemProps {
  presentation: TicketProduct["presentations"][number];
  itemId: string;
}

export interface PresentationQuantityProps {
  increase: () => void;
  decrease: () => void;
  quantity: number;
}

export interface EditPresentationProps {
  presentation: TicketProduct["presentations"][number];
  itemId: string;
}

export interface PresentationPriceKeyboardProps {
  defaultPrice: number;
  onSubmit: (price: number) => void;
  close: () => void;
}
