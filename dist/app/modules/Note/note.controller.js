"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const note_model_1 = require("./note.model");
const paginationHelper_1 = require("../../../helpars/paginationHelper");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const createNote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content } = req.body;
    const userId = req.user.id;
    const newNote = yield note_model_1.Note.create({
        title,
        content,
        userId,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Note created successfully!",
        data: newNote,
    });
}));
const getNoteList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const paginationOptions = {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortConditions = {};
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder === "desc" ? -1 : 1;
    }
    else {
        sortConditions["createdAt"] = -1;
    }
    // Define filter conditions based on user role
    const filterConditions = {};
    if (req.user.role !== "ADMIN") {
        filterConditions.userId = req.user.id;
    }
    const result = yield note_model_1.Note.find(filterConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .populate("userId", "email role"); // populate user info but not password
    const total = yield note_model_1.Note.countDocuments(filterConditions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notes retrieved successfully!",
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    });
}));
const getNoteById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const note = yield note_model_1.Note.findById(id).populate("userId", "email role");
    if (!note) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Note not found!");
    }
    // If the user is not an Admin, they can only view their own notes
    if (role !== "ADMIN" && note.userId._id.toString() !== userId) {
        throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Access forbidden! You can only view your own notes.");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Note retrieved successfully!",
        data: note,
    });
}));
const updateNote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content } = req.body;
    const note = yield note_model_1.Note.findById(id);
    if (!note) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Note not found!");
    }
    // Only the owner can update their note
    if (note.userId.toString() !== userId) {
        throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Access forbidden! You can only update your own notes.");
    }
    if (title)
        note.title = title;
    if (content)
        note.content = content;
    yield note.save();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Note updated successfully!",
        data: note,
    });
}));
const deleteNote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.id;
    const note = yield note_model_1.Note.findById(id);
    if (!note) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Note not found!");
    }
    // Only the owner can delete their note
    if (note.userId.toString() !== userId) {
        throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Access forbidden! You can only delete your own notes.");
    }
    yield note_model_1.Note.findByIdAndDelete(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Note deleted successfully!",
        data: note,
    });
}));
exports.noteController = {
    createNote,
    getNoteList,
    getNoteById,
    updateNote,
    deleteNote,
};
