"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
    interests: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
// Explicitly define indexes as requested by the task
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ interests: 1 });
UserSchema.index({ createdAt: -1 });
exports.User = (0, mongoose_1.model)('User', UserSchema);
