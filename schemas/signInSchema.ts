import * as z from "zod";
import { email } from "zod/v4";

export const signInSchema = z.object({
  identifier: z
    .string()
    .email({ message: "Please Enter a valid email" })
    .min(1, { message: "Email is required" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, {
      message: "Password must contain at least one letter",
    }),
});
