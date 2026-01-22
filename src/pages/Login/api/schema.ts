import { z } from "zod";

export const loginPayloadSchema = z.object({
  username: z.string({ required_error: "Username is required" }).min(3, "Username must be at least 3 characters long"),
  password: z.string({ required_error: "Password is required" }).min(3, "Password must be at least 3 characters long"),
});
export const userDataSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  name: z.string(),
  username: z.string(),
  media_url: z.string().optional(),
  isReferee: z.boolean().default(false),
  isBlocked: z.boolean(),
  role: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  lastLogin: z.string().datetime().optional(),
  createdBy: z.string().nullish(),
});
export const mediaUploadPayloadSchema = z.object({
  image: z.instanceof(File),
});
export type loginPayload = z.infer<typeof loginPayloadSchema>;
export type userData = z.infer<typeof userDataSchema>;
