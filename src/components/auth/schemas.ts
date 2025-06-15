
import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, { message: "Email or username is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const signUpSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
