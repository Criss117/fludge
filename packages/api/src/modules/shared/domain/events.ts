import type { DomainEvent } from "./event-bus";

export class OrganizationRegisteredEvent implements DomainEvent {
  readonly eventName = "organization:registered";
  readonly occurredAt = new Date();

  constructor(public readonly organizationId: string) {}
}
