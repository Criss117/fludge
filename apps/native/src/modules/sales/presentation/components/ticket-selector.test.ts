import { getTicketOptions } from "./ticket-selector.utils";

describe("getTicketOptions", () => {
  it("maps every ticket key to a selectable option", () => {
    const options = getTicketOptions(
      new Map([
        ["Ticket 1", {}],
        ["Ticket 2", {}],
      ]),
    );

    expect(options).toEqual([
      { label: "Ticket 1", value: "Ticket 1" },
      { label: "Ticket 2", value: "Ticket 2" },
    ]);
  });

  it("returns no options when the ticket store is empty", () => {
    expect(getTicketOptions(new Map())).toEqual([]);
  });
});
