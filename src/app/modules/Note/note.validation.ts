import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  content: z.string({ required_error: "Content is required" }),
}).strict();

const updateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
}).strict();

export const noteValidation = {
  createNoteSchema,
  updateNoteSchema,
};
