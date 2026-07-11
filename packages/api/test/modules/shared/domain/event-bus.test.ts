import { describe, expect, it, mock, spyOn } from "bun:test";

import {
  type DomainEvent,
  type EventHandler,
  type ExternalBus,
  EventBus,
} from "@fludge/api/modules/shared/domain/event-bus";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(
  name = "organization:registered",
  overrides: Partial<DomainEvent> = {},
): DomainEvent {
  return { eventName: name, occurredAt: new Date("2026-01-01T00:00:00Z"), ...overrides };
}

function makeExternalBus(publish?: (events: DomainEvent[]) => Promise<void>): ExternalBus {
  return {
    publish: publish ?? (async () => {}),
  };
}

// ---------------------------------------------------------------------------
// Constructor & register
// ---------------------------------------------------------------------------

describe("EventBus — register", () => {
  it("starts with no external bus and fail-fast mode by default", () => {
    const bus = new EventBus();
    expect(bus).toBeInstanceOf(EventBus);
  });

  it("accepts externalBus and continueOnCriticalError in options", () => {
    const bus = new EventBus({
      externalBus: makeExternalBus(),
      continueOnCriticalError: true,
    });
    expect(bus).toBeInstanceOf(EventBus);
  });

  it("returns the instance for chaining", () => {
    const bus = new EventBus();
    const handler: EventHandler = mock(() => {});
    const returned = bus.register("organization:registered", handler);
    expect(returned).toBe(bus);
  });

  it("supports multiple handlers on the same event name", async () => {
    const bus = new EventBus();
    const h1 = mock(async () => {});
    const h2 = mock(async () => {});
    bus.register("organization:registered", h1, { critical: true });
    bus.register("organization:registered", h2, { critical: true });

    await bus.dispatch(makeEvent());

    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it("logs the listener name when provided", () => {
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    const bus = new EventBus();
    bus.register("organization:registered", mock(() => {}), {
      critical: true,
      listenerName: "my-listener",
    });

    expect(logSpy).toHaveBeenCalledWith(
      "Registrando listener",
      "my-listener",
      "para",
      "organization:registered",
    );
    logSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// dispatch — critical handlers (synchronous, blocking)
// ---------------------------------------------------------------------------

describe("EventBus — dispatch critical handlers", () => {
  it("runs critical handlers synchronously and awaits them", async () => {
    const bus = new EventBus();
    const handler = mock(async () => {});
    bus.register("organization:registered", handler, { critical: true });

    await bus.dispatch(makeEvent());

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "organization:registered" }),
    );
  });

  it("awaits async critical handlers in order", async () => {
    const bus = new EventBus({ continueOnCriticalError: true });
    const order: string[] = [];
    const h1 = mock(async () => {
      await Promise.resolve();
      order.push("h1");
    });
    const h2 = mock(async () => {
      order.push("h2");
    });
    bus.register("organization:registered", h1, { critical: true });
    bus.register("organization:registered", h2, { critical: true });

    await bus.dispatch(makeEvent());

    expect(order).toEqual(["h1", "h2"]);
  });

  it("throws immediately when a critical handler fails in fail-fast mode", async () => {
    const bus = new EventBus({ continueOnCriticalError: false });
    const h1 = mock(async () => {
      throw new Error("boom");
    });
    const h2 = mock(async () => {});
    bus.register("organization:registered", h1, { critical: true });
    bus.register("organization:registered", h2, { critical: true });

    await expect(bus.dispatch(makeEvent())).rejects.toThrow("boom");

    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).not.toHaveBeenCalled();
  });

  it("continues other handlers when continueOnCriticalError is true and rethrows the single error", async () => {
    const bus = new EventBus({ continueOnCriticalError: true });
    const h1 = mock(async () => {
      throw new Error("fail-1");
    });
    const h2 = mock(async () => {});
    bus.register("organization:registered", h1, { critical: true });
    bus.register("organization:registered", h2, { critical: true });

    await expect(bus.dispatch(makeEvent())).rejects.toThrow("fail-1");

    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it("throws AggregateError when multiple critical handlers fail in continue mode", async () => {
    const bus = new EventBus({ continueOnCriticalError: true });
    const h1 = mock(async () => {
      throw new Error("fail-1");
    });
    const h2 = mock(async () => {
      throw new Error("fail-2");
    });
    bus.register("organization:registered", h1, { critical: true });
    bus.register("organization:registered", h2, { critical: true });

    await expect(bus.dispatch(makeEvent())).rejects.toThrow("Múltiples handlers críticos fallaron");
  });

  it("does not throw when no critical handlers are registered", async () => {
    const bus = new EventBus();
    const handler = mock(async () => {});
    bus.register("organization:registered", handler); // non-critical

    await expect(bus.dispatch(makeEvent())).resolves.toBeUndefined();

    // non-critical handlers are never called directly — they go to externalBus
    expect(handler).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// dispatch — non-critical handlers & external bus
// ---------------------------------------------------------------------------

describe("EventBus — dispatch non-critical to external bus", () => {
  it("publishes events with no critical handlers to the external bus", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });
    const event = makeEvent();
    const handler = mock(async () => {});
    bus.register("organization:registered", handler); // non-critical

    await bus.dispatch(event);

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith([event]);
    expect(handler).not.toHaveBeenCalled();
  });

  it("publishes events with no handlers at all to the external bus", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });

    await bus.dispatch(makeEvent());

    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("publishes to external bus when an event has both critical and non-critical handlers", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });
    const criticalHandler = mock(async () => {});
    const nonCriticalHandler = mock(async () => {});
    bus.register("organization:registered", criticalHandler, { critical: true });
    bus.register("organization:registered", nonCriticalHandler);

    await bus.dispatch(makeEvent());

    expect(criticalHandler).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("does NOT publish to external bus when an event has only critical handlers", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });
    const handler = mock(async () => {});
    bus.register("organization:registered", handler, { critical: true });

    await bus.dispatch(makeEvent());

    expect(handler).toHaveBeenCalledTimes(1);
    expect(publish).not.toHaveBeenCalled();
  });

  it("swallows external bus publish errors (fire-and-forget)", async () => {
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});
    const bus = new EventBus({
      externalBus: {
        publish: async () => {
          throw new Error("external-bus-down");
        },
      },
    });

    await bus.dispatch(makeEvent());

    // Wait one tick so the fire-and-forget .catch runs
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith(
      "[EventBus] Error publicando al bus externo:",
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  it("does nothing for non-critical events when no external bus is configured", async () => {
    const bus = new EventBus();
    const handler = mock(async () => {});
    bus.register("organization:registered", handler); // non-critical

    await expect(bus.dispatch(makeEvent())).resolves.toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// dispatch — array of events
// ---------------------------------------------------------------------------

describe("EventBus — dispatch array of events", () => {
  it("dispatches multiple events in a single call", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });
    const events = [
      makeEvent("organization:registered"),
      makeEvent("organization:registered"),
    ];

    await bus.dispatch(events);

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(events);
  });

  it("runs critical handlers for all events in the array", async () => {
    const bus = new EventBus();
    const handler = mock(async () => {});
    bus.register("organization:registered", handler, { critical: true });

    const events = [
      makeEvent("organization:registered"),
      makeEvent("organization:registered"),
    ];

    await bus.dispatch(events);

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("runs critical handlers for each event in the array without external bus when only critical handlers exist", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });
    const criticalHandler = mock(async () => {});
    bus.register("organization:registered", criticalHandler, { critical: true });

    const events = [
      makeEvent("organization:registered"),
      makeEvent("organization:registered"),
    ];

    await bus.dispatch(events);

    expect(criticalHandler).toHaveBeenCalledTimes(2);
    // Only critical handlers registered → hasCritical=true, hasNonCritical=false →
    // events go to criticalEvents, NOT to nonCriticalEvents → external bus untouched.
    expect(publish).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// dispatch — edge cases
// ---------------------------------------------------------------------------

describe("EventBus — edge cases", () => {
  it("calls only handlers registered for the dispatched event name", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });
    const handler = mock(async () => {});
    bus.register("organization:registered", handler, { critical: true });

    await bus.dispatch(
      makeEvent("organization:registered", {
        occurredAt: new Date("2026-02-01T00:00:00Z"),
      }),
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "organization:registered",
        occurredAt: new Date("2026-02-01T00:00:00Z"),
      }),
    );
  });

  it("supports sync (non-async) critical handlers", async () => {
    const bus = new EventBus();
    const handler = mock(() => {}); // sync handler
    bus.register("organization:registered", handler, { critical: true });

    await bus.dispatch(makeEvent());

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("equates a single event and an array with one element", async () => {
    const publish = mock(async () => {});
    const bus = new EventBus({
      externalBus: makeExternalBus(publish),
    });

    const event = makeEvent();
    await bus.dispatch(event);

    // Single event is wrapped into array of length 1
    expect(publish).toHaveBeenCalledWith([event]);
  });
});