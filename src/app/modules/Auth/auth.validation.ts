import { z } from "zod";

const registerSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Please provide a valid email address"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["USER", "ADMIN"]).optional(),
  interests: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Please provide a valid email address"),
  password: z
    .string({
      required_error: "Password is required",
    }),
});

export const authValidation = {
  registerSchema,
  loginSchema,
};
