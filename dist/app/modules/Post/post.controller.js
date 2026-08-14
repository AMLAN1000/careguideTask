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
exports.postController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const post_model_1 = require("./post.model");
const paginationHelper_1 = require("../../../helpars/paginationHelper");
const createPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content } = req.body;
    const userId = req.user.id;
    const newPost = yield post_model_1.Post.create({
        title,
        content,
        userId,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Post created successfully!",
        data: newPost,
    });
}));
const getPostList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield post_model_1.Post.find()
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .populate("userId", "email role");
    const total = yield post_model_1.Post.countDocuments();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Posts retrieved successfully!",
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    });
}));
exports.postController = {
    createPost,
    getPostList,
};
