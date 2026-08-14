"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
const createUserSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: zod_1.z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters long"),
    role: zod_1.z.enum(['USER', 'ADMIN']).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional()
}).strict();
const updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long").optional(),
    role: zod_1.z.enum(['USER', 'ADMIN']).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional()
}).strict();
exports.userValidation = {
    createUserSchema,
    updateUserSchema
};
