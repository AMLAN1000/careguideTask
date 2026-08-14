import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters long"),
  role: z.enum(['USER', 'ADMIN']).optional(),
  interests: z.array(z.string()).optional()
}).strict();

const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  interests: z.array(z.string()).optional()
}).strict();

export const userValidation = {
  createUserSchema,
  updateUserSchema
};