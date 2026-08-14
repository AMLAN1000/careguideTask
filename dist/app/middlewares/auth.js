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
const config_1 = __importDefault(require("../../config"));
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const jwtHelpers_1 = require("../../helpars/jwtHelpers");
const user_model_1 = require("../modules/User/user.model");
const auth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = req.headers.authorization;
            if (!token) {
                throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!", "UNAUTHORIZED");
            }
            // Handle Bearer prefix if present
            const tokenParts = token.split(" ");
            const actualToken = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(actualToken, config_1.default.jwt.jwt_secret);
            const { id, role } = verifiedUser;
            // Check if user exists in DB
            const user = yield user_model_1.User.findById(id);
            if (!user) {
                throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found!", "USER_NOT_FOUND");
            }
            req.user = verifiedUser;
            // Role-based access
            if (roles.length && !roles.includes(role)) {
                throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "Forbidden!", "FORBIDDEN");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.default = auth;
