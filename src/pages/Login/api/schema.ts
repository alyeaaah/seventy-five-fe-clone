import { z } from "zod";

export const loginPayloadSchema = z.object({
  username: z.string({ required_error: "Username is required" }).min(3, "Username must be at least 3 characters long"),
  password: z.string({ required_error: "Password is required" }).min(3, "Password must be at least 3 characters long"),
});

export const forgotPasswordPayloadSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
});

export const resetPasswordPayloadSchema = z.object({
  token: z.string({ required_error: "Token is required" }),
  newPassword: z.string({ required_error: "New password is required" }).min(6, "Password must be at least 6 characters"),
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
export type forgotPasswordPayload = z.infer<typeof forgotPasswordPayloadSchema>;
export type resetPasswordPayload = z.infer<typeof resetPasswordPayloadSchema>;
export type userData = z.infer<typeof userDataSchema>;
