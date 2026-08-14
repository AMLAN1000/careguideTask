import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  content: z.string({ required_error: "Content is required" }),
}).strict();

export const postValidation = {
  createPostSchema,
};
