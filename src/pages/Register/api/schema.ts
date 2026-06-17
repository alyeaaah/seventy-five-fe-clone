import { playersSchema } from "@/pages/Admin/Players/api/schema";
import { z } from "zod";
export const registerSchema = z.object({
  name: z.string({required_error: "Player name is required"}),
  username: z.string({required_error: "Username is required"})
  .min(3, { message: 'Username must be at least 3 characters long' })
  .max(30, { message: 'Username cannot exceed 20 characters' })
  .regex(/^[a-zA-Z0-9_.]+$/, {
    message: 'Username can only contain letters, numbers, underscores and dots',
  })
  .trim(),
  email: z.string({required_error: "Email is required"}).email("Invalid email"),
  phone: z.string({required_error: "Phone is required" })
    .min(8, "Phone must be at least 8 characters long")
    .max(15, "Phone must be at most 15 characters long")
    .refine(
      (value: string) => /^[0-9]+$/.test(value),
      "Phone can only contain numbers"
  ),
  
  socialMediaIg: z.string({required_error: "Instagram username is required"}),
  socialMediaReclub: z.string().nullish(),
  media_url: z.string({required_error: "Profile picture is required"}),
  dateOfBirth: z.string({required_error: "Date of birth is required"}),
  placeOfBirth: z.string({required_error: "Place of birth is required"}).min(2, "Place of birth is required"),
  gender: z.enum(['m', 'f'], {
    required_error: "Gender can't be empty",
    invalid_type_error: "Please select a valid gender (male or female)",
    message: "Please select a valid gender (male or female)",
  }),
}).extend({
  password: z.string()
    .min(1, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password must not exceed 32 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    // .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword, 
  {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Shows error on confirmPassword field
  }
);
export type RegisterPayload = z.infer<typeof registerSchema>;
