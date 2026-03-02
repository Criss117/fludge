import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { baseProcedure } from "@fludge/api";
import { signUpEmailSchema } from "@fludge/utils/validators/auth.schemas";
import { tryCatch } from "@fludge/utils/try-catch";
import { db } from "@fludge/db";
import {
  member,
  organization,
  type SelectOrganization,
} from "@fludge/db/schema/organization";
import { InternalServerErrorException } from "../shared/exceptions/internal-server-error.exception";
import { signUpEmailUseCase } from "./usecases/sign-up-email.usecase";
import { authMiddleware } from "@fludge/api/middlewares/auth.middleware";
import { requireAuthMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { session } from "@fludge/db/schema/auth";
import { OrganizationNotFoundException } from "../organizations/exceptions/organization-not-found.exception";

export const authProcedures = {
  getSession: baseProcedure({
    method: "GET",
    description: "Get the current session",
    tags: ["Auth"],
  })
    .use(authMiddleware)
    .handler(async ({ context }) => {
      if (!context.session) return null;

      const user = context.session.user;

      let organizations: SelectOrganization[];

      if (user.isRoot) {
        const { data, error } = await tryCatch(
          db
            .select()
            .from(organization)
            .where(eq(organization.rootUserId, user.id)),
        );

        if (error)
          throw new InternalServerErrorException(
            "Hubo un error al obtener las organizaciones",
          );

        organizations = data;
      } else {
        const { data, error } = await tryCatch(
          db
            .select()
            .from(member)
            .innerJoin(organization, eq(organization.id, member.organizationId))
            .where(eq(member.userId, user.id))
            .limit(1),
        );

        if (error)
          throw new InternalServerErrorException(
            "Hubo un error al obtener las organizaciones",
          );

        const org = data.at(0)?.organization;

        if (!org)
          throw new InternalServerErrorException(
            "Hubo un error al obtener las organizaciones",
          );

        organizations = [org];
      }

      return {
        ...context.session,
        organizations,
      };
    }),

  signUp: {
    root: baseProcedure({
      tags: ["Auth"],
    })
      .input(signUpEmailSchema)
      .handler(({ input }) => signUpEmailUseCase.execute(input)),
  },

  setActiveOrganization: baseProcedure({
    tags: ["Auth"],
  })
    .use(requireAuthMiddleware())
    .input(z.object({ organizationId: z.string() }))
    .handler(async ({ input, context }) => {
      const activeOrganizationId = context.session.activeOrganizationId;

      const alreadyActive = activeOrganizationId === input.organizationId;

      if (alreadyActive) return;

      const userIsRoot = context.session.user.isRoot;

      if (userIsRoot) {
        const { data, error } = await tryCatch(
          db
            .select({
              id: organization.id,
            })
            .from(organization)
            .where(
              and(
                eq(organization.id, input.organizationId),
                eq(organization.rootUserId, context.session.user.id),
              ),
            ),
        );

        if (error)
          throw new InternalServerErrorException(
            "Hubo un error al obtener la organización",
          );

        const org = data.at(0)?.id;

        if (!org)
          throw new OrganizationNotFoundException(
            "Hubo un error al obtener la organización",
          );
      } else {
        const { data, error } = await tryCatch(
          db
            .select({ id: member.organizationId })
            .from(member)
            .where(
              and(
                eq(member.organizationId, input.organizationId),
                eq(member.userId, context.session.user.id),
              ),
            ),
        );

        if (error)
          throw new InternalServerErrorException(
            "Hubo un error al obtener la organización",
          );

        const org = data.at(0)?.id;

        if (!org)
          throw new OrganizationNotFoundException(
            "Hubo un error al obtener la organización",
          );
      }

      const { error } = await tryCatch(
        db
          .update(session)
          .set({
            activeOrganizationId: input.organizationId,
          })
          .where(
            and(
              eq(session.userId, context.session.user.id),
              eq(session.id, context.session.id),
            ),
          ),
      );

      if (error)
        throw new InternalServerErrorException(
          "Hubo un error al actualizar la sesión",
        );
    }),
};
