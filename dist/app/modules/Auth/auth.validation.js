"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: "Email is required",
    })
        .email("Please provide a valid email address"),
    password: zod_1.z
        .string({
        required_error: "Password is required",
    })
        .min(6, "Password must be at least 6 characters long"),
    role: zod_1.z.enum(["USER", "ADMIN"]).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: "Email is required",
    })
        .email("Please provide a valid email address"),
    password: zod_1.z
        .string({
        required_error: "Password is required",
    }),
});
exports.authValidation = {
    registerSchema,
    loginSchema,
};
