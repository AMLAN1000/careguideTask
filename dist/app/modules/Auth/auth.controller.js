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
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_model_1 = require("../User/user.model");
const jwtHelpers_1 = require("../../../helpars/jwtHelpers");
const config_1 = __importDefault(require("../../../config"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const registerUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role, interests } = req.body;
    // Check if user already exists
    const existingUser = yield user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "User with this email already exists!");
    }
    // Hash password
    const saltRounds = Number(config_1.default.bcrypt_salt_rounds) || 12;
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
    const newUser = yield user_model_1.User.create({
        email,
        password: hashedPassword,
        role: role || "USER",
        interests: interests || [],
    });
    // Exclude password from the returned object
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
        message: "User registered successfully!",
        data: userResult,
    });
}));
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Find user and explicitly select password
    const user = yield user_model_1.User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    // Compare password
    const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Incorrect password!");
    }
    // Generate token
    const tokenPayload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(tokenPayload, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Logged in successfully!",
        data: {
            accessToken,
        },
    });
}));
exports.AuthController = {
    registerUser,
    loginUser,
};
