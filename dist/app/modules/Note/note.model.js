"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = require("mongoose");
const NoteSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Explicitly define indexes as requested by the task
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ createdAt: -1 });
exports.Note = (0, mongoose_1.model)('Note', NoteSchema);
