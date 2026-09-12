import { initialTicketStore, type TicketStore } from "./data";

const SCHEMA_VERSION = 1;

type PersistedTicketStore = TicketStore & {
  version: number;
};

function serialize(state: TicketStore): PersistedTicketStore {
  return {
    ...state,
    lastError: null, // nunca persistimos un error transitorio de UI
    version: SCHEMA_VERSION,
  };
}

function isValidShape(data: unknown): data is PersistedTicketStore {
  if (typeof data !== "object" || data === null) return false;

  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.tickets === "object" &&
    candidate.tickets !== null &&
    typeof candidate.activeTicketId === "string" &&
    typeof candidate.version === "number"
  );
}

function deserialize(data: unknown): TicketStore {
  if (!isValidShape(data)) {
    return initialTicketStore;
  }

  if (data.version !== SCHEMA_VERSION) {
    // Aquí irían migraciones si en el futuro cambia el schema
    return initialTicketStore;
  }

  // El activeTicketId debe corresponder a un ticket que realmente exista
  if (!data.tickets[data.activeTicketId]) {
    return initialTicketStore;
  }

  return {
    tickets: data.tickets,
    activeTicketId: data.activeTicketId,
    lastError: null,
  };
}

export const persistTickets = {
  serialize,
  deserialize,
};
