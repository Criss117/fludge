import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrganization } from "@fludge/client/providers/organization.provider";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  AddCatalogTicketProduct,
  AddTicketProduct,
  Ticket,
  TicketProduct,
} from "../domain/repositories/local-ticket.repository";

function getTicketProductStockQuantity(product: TicketProduct): number {
  return product.presentations.reduce(
    (total, presentation) =>
      total + presentation.quantity * presentation.conversionFactor,
    0,
  );
}

function validateTicketProductStock(product: TicketProduct) {
  if (product.allowsNegativeStock) return;

  const requestedQuantity = getTicketProductStockQuantity(product);

  if (requestedQuantity > product.stock) {
    throw new Error(
      `Insufficient stock for product "${product.id}". ` +
        `Requested: ${requestedQuantity}, available: ${product.stock}`,
    );
  }
}

function mergeTicketProduct(
  current: TicketProduct,
  incoming: AddCatalogTicketProduct,
): TicketProduct {
  const presentations = [...current.presentations];

  for (const incomingPresentation of incoming.presentations) {
    const existingPresentation = presentations.find(
      (presentation) =>
        presentation.presentationId === incomingPresentation.presentationId,
    );

    if (!existingPresentation) {
      presentations.push(incomingPresentation);
      continue;
    }

    existingPresentation.quantity += incomingPresentation.quantity;
  }

  return {
    ...current,
    presentations,
  };
}

export function useFindAllTickets() {
  const { activeOrganization } = useOrganization();
  const { salesContainer } = useContainer();

  if (!activeOrganization) throw new Error("Active organization not found");

  return useSuspenseQuery({
    queryKey: ["orgnaizations", activeOrganization.id, "sales", "tickets"],
    queryFn: async () =>
      salesContainer.localTicketRepository.load(activeOrganization.id),
  });
}

export function useInvalidateTicketsQueries() {
  const { activeOrganization } = useOrganization();
  const queryClient = useQueryClient();

  if (!activeOrganization) throw new Error("Active organization not found");

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["orgnaizations", activeOrganization.id, "sales", "tickets"],
    });
  };

  return { invalidateAll };
}

export function useTicketStore() {
  const { data: store, refetch } = useFindAllTickets();
  const { activeOrganization } = useOrganization();
  const { salesContainer } = useContainer();

  if (!activeOrganization) throw new Error("Active organization not found");

  async function persist(nextTickets: Ticket[]) {
    await salesContainer.localTicketRepository.save(
      activeOrganization!.id,
      nextTickets,
    );
    await refetch();
  }

  const switchActiveTicket = useMutation({
    mutationKey: ["sales", "tickets", "switch_active"],
    mutationFn: async (ticketId: string) => {
      const currentActiveTicket = store.find((t) => t.isActive)!;

      if (currentActiveTicket.id === ticketId) return;

      const newActiveTicket = store.find((t) => t.id === ticketId);

      if (!newActiveTicket) return;

      const nextTickets = store.map((t) => {
        if (t.id === ticketId) return { ...t, isActive: true };
        return { ...t, isActive: false };
      });

      await persist(nextTickets);
    },
  });

  const createTicket = useMutation({
    mutationKey: ["sales", "tickets", "create"],
    mutationFn: async () => {
      const existingNames = new Set(store.map((t) => t.name));

      let number = store.length + 1;
      let name = `Ticket-${number}`;

      while (existingNames.has(name)) {
        number++;
        name = `Ticket-${number}`;
      }

      const newTicket: Ticket = {
        id: crypto.randomUUID(),
        isActive: true,
        name,
        organizationId: activeOrganization.id,
        products: [],
      };

      const nextTickets = [...store, newTicket];

      await persist(nextTickets);
    },
  });

  const removeTicket = useMutation({
    mutationKey: ["sales", "tickets", "remove"],
    mutationFn: async (ticketId: string) => {
      if (!store.some((t) => t.id === ticketId)) return;

      const nextTickets = store.filter((t) => t.id !== ticketId);

      await persist(nextTickets);
    },
  });

  const renameTicket = useMutation({
    mutationKey: ["sales", "tickets", "rename"],
    mutationFn: async ({
      ticketId,
      name,
    }: {
      ticketId: string;
      name: string;
    }) => {
      if (!store.some((t) => t.id === ticketId)) return;

      if (store.some((t) => t.name === name)) return;

      const nextTickets = store.map((t) => {
        if (t.id === ticketId) return { ...t, name };
        return t;
      });

      await persist(nextTickets);
    },
  });

  const addProduct = useMutation({
    mutationKey: ["sales", "tickets", "add_product"],
    mutationFn: async (product: AddTicketProduct) => {
      const activeTicket = store.find((ticket) => ticket.isActive);

      if (!activeTicket) throw new Error(`Ticket  not found`);

      if (product.type === "adHoc") {
        const newProduct: TicketProduct = {
          ...product,
          id: crypto.randomUUID(),
          ticketId: activeTicket.id,
          productId: null,
          presentations: product.presentations.map((presentation) => ({
            ...presentation,
            presentationId: null,
          })),
        };

        const nextTickets = store.map((t) => {
          if (t.id === activeTicket.id)
            return { ...t, products: [...t.products, newProduct] };
          return t;
        });

        await persist(nextTickets);
        return;
      }

      const existingProduct = activeTicket.products.find(
        (ticketProduct) => ticketProduct.productId === product.productId,
      );

      let nextProduct: TicketProduct;

      if (!existingProduct) {
        const nextProductId = crypto.randomUUID();

        nextProduct = {
          ...product,
          id: nextProductId,
          ticketId: activeTicket.id,
          presentations: product.presentations.map((p) => ({
            ...p,
            id: crypto.randomUUID(),
            ticketProductId: nextProductId,
          })),
        };
      } else {
        nextProduct = mergeTicketProduct(existingProduct, product);
      }

      validateTicketProductStock(nextProduct);

      const nextProducts = existingProduct
        ? activeTicket.products.map((ticketProduct) =>
            ticketProduct.productId === product.productId
              ? nextProduct
              : ticketProduct,
          )
        : [...activeTicket.products, nextProduct];

      const nextTickets = store.map((currentTicket) =>
        currentTicket.id === activeTicket.id
          ? {
              ...currentTicket,
              products: nextProducts,
            }
          : currentTicket,
      );

      await persist(nextTickets);
    },
  });

  const removeProduct = useMutation({
    mutationKey: ["sales", "tickets", "remove_product"],
    mutationFn: async (ticketProductId: string) => {
      const activeTicket = store.find((ticket) => ticket.isActive);

      if (!activeTicket) throw new Error("Active ticket not found");

      const productExists = activeTicket.products.some(
        (product) => product.id === ticketProductId,
      );

      if (!productExists) return;

      const nextProducts = activeTicket.products.filter(
        (product) => product.id !== ticketProductId,
      );

      const nextTickets = store.map((ticket) =>
        ticket.id === activeTicket.id
          ? {
              ...ticket,
              products: nextProducts,
            }
          : ticket,
      );

      await persist(nextTickets);
    },
  });

  const removePresentations = useMutation({
    mutationKey: ["sales", "tickets", "remove_presentations"],
    mutationFn: async (presentationIds: string[]) => {
      const activeTicket = store.find((ticket) => ticket.isActive);

      if (!activeTicket) throw new Error("Active ticket not found");

      if (presentationIds.length === 0) return;

      const idsToRemove = new Set(presentationIds);

      const nextProducts = activeTicket.products
        .map((product) => ({
          ...product,
          presentations: product.presentations.filter(
            (presentation) => !idsToRemove.has(presentation.id),
          ),
        }))
        .filter((product) => product.presentations.length > 0);

      const nextTickets = store.map((ticket) =>
        ticket.id === activeTicket.id
          ? {
              ...ticket,
              products: nextProducts,
            }
          : ticket,
      );

      await persist(nextTickets);
    },
  });

  const updatePresentation = useMutation({
    mutationKey: ["sales", "tickets", "update_presentation"],
    mutationFn: async ({
      ticketProductId,
      ticketProductPresentationId,
      quantity,
      priceSale,
    }: {
      ticketProductId: string;
      ticketProductPresentationId: string;
      quantity: number;
      priceSale: number;
    }) => {
      const activeTicket = store.find((ticket) => ticket.isActive);

      if (!activeTicket) throw new Error("Active ticket not found");

      const product = activeTicket.products.find(
        (product) => product.id === ticketProductId,
      );

      if (!product)
        throw new Error(`Ticket product "${ticketProductId}" not found`);

      const presentationExists = product.presentations.some(
        (presentation) => presentation.id === ticketProductPresentationId,
      );

      if (!presentationExists)
        throw new Error(
          `Ticket product presentation "${ticketProductPresentationId}" not found`,
        );

      const nextProduct: TicketProduct = {
        ...product,
        presentations: product.presentations.map((presentation) =>
          presentation.id === ticketProductPresentationId
            ? {
                ...presentation,
                quantity,
                priceSale,
              }
            : presentation,
        ),
      };

      validateTicketProductStock(nextProduct);

      const nextProducts = activeTicket.products.map((currentProduct) =>
        currentProduct.id === product.id ? nextProduct : currentProduct,
      );

      const nextTickets = store.map((ticket) =>
        ticket.id === activeTicket.id
          ? {
              ...ticket,
              products: nextProducts,
            }
          : ticket,
      );

      await persist(nextTickets);
    },
  });

  return {
    store,
    switchActiveTicket,
    createTicket,
    removeTicket,
    renameTicket,
    addProduct,
    removeProduct,
    removePresentations,
    updatePresentation,
  };
}
