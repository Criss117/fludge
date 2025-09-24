import z from "zod";
import {
  createCollection,
  localOnlyCollectionOptions,
} from "@tanstack/react-db";

export const categorySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  businessId: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  deletedAt: z.date().nullable().optional(),
});

export const categoriesCollection = createCollection(
  localOnlyCollectionOptions({
    schema: categorySummarySchema,
    id: "categories",
    getKey: (category) => category.id,
  })
);
