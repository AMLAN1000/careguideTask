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
exports.userController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_model_1 = require("./user.model");
const paginationHelper_1 = require("../../../helpars/paginationHelper");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const config_1 = __importDefault(require("../../../config"));
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role, interests } = req.body;
    const existingUser = yield user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "User with this email already exists!");
    }
    const saltRounds = Number(config_1.default.bcrypt_salt_rounds) || 12;
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
    const newUser = yield user_model_1.User.create({
        email,
        password: hashedPassword,
        role: role || "USER",
        interests: interests || [],
    });
    const userResult = {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        interests: newUser.interests,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    };
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "User created successfully by admin!",
        data: userResult,
    });
}));
const getUserList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield user_model_1.User.find()
        .sort(sortConditions)
        .skip(skip)
        .limit(limit);
    const total = yield user_model_1.User.countDocuments();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User list retrieved successfully!",
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    });
}));
const getUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User profile not found!");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User profile retrieved successfully!",
        data: user,
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const payload = Object.assign({}, req.body);
    if (payload.password) {
        const saltRounds = Number(config_1.default.bcrypt_salt_rounds) || 12;
        payload.password = yield bcrypt_1.default.hash(payload.password, saltRounds);
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (!updatedUser) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found to update!");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User updated successfully!",
        data: updatedUser,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedUser = yield user_model_1.User.findByIdAndDelete(id);
    if (!deletedUser) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found to delete!");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User deleted successfully!",
        data: deletedUser,
    });
}));
// Scenario 1: Group Users by Interests using a single collection.aggregate() call
const getUsersGroupedByInterests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.aggregate([
        {
            $unwind: "$interests",
        },
        {
            $group: {
                _id: "$interests",
                users: {
                    $push: {
                        _id: "$_id",
                        email: "$email",
                    },
                },
            },
        },
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Users grouped by interests retrieved successfully!",
        data: result,
    });
}));
// Scenario 2: Retrieve posts belonging to a user using $lookup in a single aggregation pipeline
const getUserPostsAggregation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Invalid user ID format");
    }
    const result = yield user_model_1.User.aggregate([
        {
            $match: { _id: new mongoose_1.default.Types.ObjectId(id) },
        },
        {
            $lookup: {
                from: "posts", // Name of MongoDB posts collection
                localField: "_id",
                foreignField: "userId",
                as: "posts",
            },
        },
    ]);
    if (!result.length) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User posts retrieved successfully via lookup!",
        data: result[0],
    });
}));
exports.userController = {
    createUser,
    getUserList,
    getUserById,
    updateUser,
    deleteUser,
    getUsersGroupedByInterests,
    getUserPostsAggregation,
};
