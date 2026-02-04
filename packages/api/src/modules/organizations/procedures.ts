import { publicProcedure } from "@fludge/api";
import { z } from "zod";

export const organizationsProcedures = {
  sayHi: publicProcedure
    .input(z.object({ name: z.string() }))
    .handler(({ input }) => {
      return `Hi ${input.name}`;
    }),
};
