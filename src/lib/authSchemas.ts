import { z } from "zod";

// Same rules as the backend (auth.schema.ts), so most mistakes are caught before sending.
const email = z.string().trim().pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100, "Use at most 100 characters"),
  email,
  password: z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
