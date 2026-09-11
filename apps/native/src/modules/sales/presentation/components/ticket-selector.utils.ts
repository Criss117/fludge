type TicketOption = { label: string; value: string };

export function getTicketOptions(
  tickets: ReadonlyMap<string, unknown>,
): TicketOption[] {
  return Array.from(tickets.keys()).map((ticketId) => ({
    label: ticketId,
    value: ticketId,
  }));
}
