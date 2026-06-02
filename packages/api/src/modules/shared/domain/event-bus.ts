import type { EVENTS_KEYS_TYPE } from "./events-keys";

export interface DomainEvent {
  readonly eventName: EVENTS_KEYS_TYPE;
  readonly occurredAt: Date;
}

export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void> | void;

export interface HandlerOptions {
  /**
   * Si true, el handler corre síncronamente dentro del dispatch.
   * Un fallo aquí lanza excepción y puede hacer rollback.
   *
   * Si false (default), el evento se publica hacia afuera (external bus)
   * y no bloquea la respuesta.
   */
  critical?: boolean;

  listenerName?: string;
}

interface RegisteredHandler {
  handler: EventHandler;
  critical: boolean;
}

export interface ExternalBus {
  publish(events: DomainEvent[]): Promise<void>;
}

export interface EventBusOptions {
  /**
   * Bus externo (SNS, EventBridge, etc.) al que se publican
   * los eventos no críticos.
   */
  externalBus?: ExternalBus;

  /**
   * Si true, un handler crítico que falla no detiene
   * a los demás críticos. Los errores se acumulan y se
   * lanzan al final como AggregateError.
   * Default: false (fail-fast).
   */
  continueOnCriticalError?: boolean;
}

export class EventBus {
  private handlers = new Map<EVENTS_KEYS_TYPE, RegisteredHandler[]>();
  private externalBus?: ExternalBus;
  private continueOnCriticalError: boolean;

  constructor(options: EventBusOptions = {}) {
    this.externalBus = options.externalBus;
    this.continueOnCriticalError = options.continueOnCriticalError ?? false;
  }

  register<T extends DomainEvent>(
    eventName: EVENTS_KEYS_TYPE,
    handler: EventHandler<T>,
    options: HandlerOptions = {},
  ): this {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push({
      handler: handler as EventHandler,
      critical: options.critical ?? false,
    });
    this.handlers.set(eventName, existing);

    if (options.listenerName)
      console.log(
        "Registrando listener",
        options.listenerName,
        "para",
        eventName,
      );
    return this;
  }

  async dispatch(events: DomainEvent | DomainEvent[]): Promise<void> {
    const arrayEvents = Array.isArray(events) ? events : [events];

    const criticalEvents: DomainEvent[] = [];
    const nonCriticalEvents: DomainEvent[] = [];

    for (const event of arrayEvents) {
      const registered = this.handlers.get(event.eventName) ?? [];
      const hasCritical = registered.some((r) => r.critical);
      const hasNonCritical = registered.some((r) => !r.critical);

      if (hasCritical) criticalEvents.push(event);
      if (hasNonCritical || !hasCritical) nonCriticalEvents.push(event);
    }

    // 1. Correr handlers críticos primero — síncronos, bloquean la respuesta
    await this.dispatchCritical(criticalEvents);

    // 2. Publicar al bus externo los no críticos — no bloquean
    if (nonCriticalEvents.length && this.externalBus) {
      // fire-and-forget: no await intencional
      this.externalBus.publish(nonCriticalEvents).catch((err) => {
        console.error("[EventBus] Error publicando al bus externo:", err);
      });
    }
  }

  private async dispatchCritical(events: DomainEvent[]): Promise<void> {
    if (!events.length) return;

    const errors: unknown[] = [];

    for (const event of events) {
      const registered = this.handlers.get(event.eventName) ?? [];
      const criticalHandlers = registered.filter((r) => r.critical);

      for (const { handler } of criticalHandlers) {
        try {
          await handler(event);
        } catch (err) {
          if (this.continueOnCriticalError) {
            errors.push(err);
          } else {
            throw err;
          }
        }
      }
    }

    if (errors.length === 1) throw errors[0];
    if (errors.length > 1)
      throw new AggregateError(errors, "Múltiples handlers críticos fallaron");
  }
}

const externalBus: ExternalBus = {
  async publish(events: DomainEvent[]) {
    console.log("Publicando al bus externo:", events);
    // Aquí iría la lógica real para publicar a SNS, EventBridge, etc.
  },
};

export const eventBus = new EventBus({
  externalBus,
});
