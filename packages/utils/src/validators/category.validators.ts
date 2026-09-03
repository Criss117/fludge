import { z } from "zod";
import { statusEnum } from "../enums/db-enums";
import { descriptionSchema, nameSchema, uuidSchema } from "./shared";

export const createCategoryValidator = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const deleteCategoryValidator = z.object({
  id: uuidSchema(),
});

export const updateCategoryValidator = z.object({
  id: uuidSchema(),
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  status: z.enum(statusEnum).optional(),
});
