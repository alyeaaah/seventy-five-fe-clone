import { z } from "zod";

export const courtFieldSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  type: z.enum(['Grass', 'Hard Court', 'Clay', 'Flexi Pave']),
  media_url: z.string().optional(),
  media_uuid: z.string().uuid().optional(),
});

export const courtsSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  fields_count: z.number().or(z.string()).optional(),
  fields: z.array(courtFieldSchema).nullish(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const courtDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  lat: z.string().optional(),
  long: z.string().optional(),
  fields: z.array(courtFieldSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const courtsPayloadSchema = z.object({
  uuid: z.string().optional(),
  name: z.string()
    .min(2, "Court name must be at least 2 characters long")
    .refine(
      (value: string) => /^[a-zA-Z0-9_ -]+$/.test(value),
      "Court name can only contain letters, numbers, underscores, and spaces"
  ),
  address: z.string()
    .min(2, "address must be at least 2 characters long"),
  city: z.string()
    .min(2, "city must be at least 2 characters long"),
  lat: z.string()
    .optional(),
  long: z.string()
    .optional(),
  fields: z.array(z.object({
    name: z.string()
      .min(2, "Field name must be at least 2 characters long")
      .refine(
        (value: string) => /^[a-zA-Z0-9_ ]+$/.test(value), // Added space after underscore
        "Field name can only contain letters, numbers, underscores, and spaces"
      ),
    type: z.enum(['Grass', 'Hard Court', 'Clay', 'Flexi Pave'], {
      required_error: "Type can't be empty",
      invalid_type_error: "Please select a valid court type (Grass, Hard Court, Clay, or Flexi Pave)",
      message: "Please select a valid court type (Grass, Hard Court, Clay, or Flexi Pave)",
    }),
    media_url: z.string().optional(),
    media_uuid: z.string().optional(),
    uuid: z.string().optional(),
    is_delete: z.number().optional(),
  })),
});
export type CourtsData = z.infer<typeof courtsSchema>;
export type CourtsPayload = z.infer<typeof courtsPayloadSchema>;
export type CourtDetail = z.infer<typeof courtDetailSchema>;
export type CourtField = z.infer<typeof courtFieldSchema>;

