import type { DomainEvent } from "./event-bus";

export class OrganizationRegisteredEvent implements DomainEvent {
  readonly eventName = "organization:registered";
  readonly occurredAt = new Date();
  readonly memberId: string | null = null;

  constructor(
    public readonly organizationId: string,
    memberId: string | null,
  ) {
    this.memberId = memberId;
  }
}
