import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/trycatch";
import { ORPCError } from "@orpc/server";

export class FindActiveOrganizationQuery {
  public async execute(headers: Headers) {
    const [data, error] = await tryCatch(
      auth.api.getFullOrganization({
        headers: headers,
      }),
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return data;
  }
}
