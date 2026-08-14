"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteValidation = void 0;
const zod_1 = require("zod");
const createNoteSchema = zod_1.z.object({
    title: zod_1.z.string({ required_error: "Title is required" }),
    content: zod_1.z.string({ required_error: "Content is required" }),
}).strict();
const updateNoteSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
}).strict();
exports.noteValidation = {
    createNoteSchema,
    updateNoteSchema,
};
