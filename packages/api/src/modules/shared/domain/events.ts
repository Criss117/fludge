import type { DomainEvent } from "./event-bus";

export class OrganizationRegisteredEvent implements DomainEvent {
  readonly eventName = "organization:registered";
  readonly occurredAt = new Date();
  readonly changedByMemberId: string | null = null;

  constructor(
    public readonly organizationId: string,
    changedByMemberId: string | null,
  ) {
    this.changedByMemberId = changedByMemberId;
  }
}
