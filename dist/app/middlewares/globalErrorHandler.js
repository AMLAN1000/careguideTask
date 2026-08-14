"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const zod_1 = require("zod");
const handleZodError_1 = __importDefault(require("../../errors/handleZodError"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const config_1 = __importDefault(require("../../config"));
const GlobalErrorHandler = (err, req, res, next) => {
    let statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!";
    let errorSources = [];
    // Handle Zod Validation Errors
    if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorSources = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorSources;
    }
    // Handle Custom ApiError
    else if (err instanceof ApiErrors_1.default) {
        statusCode = err.statusCode;
        message = err.message;
        errorSources = [{ type: "ApiError", details: err.message }];
    }
    // Handle Mongoose CastError (e.g. invalid ObjectId)
    else if (err.name === "CastError") {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = `Invalid ID format for: ${err.path}`;
        errorSources = [{ type: "CastError", details: err.message }];
    }
    // Handle Mongoose ValidationError
    else if (err.name === "ValidationError") {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = err.message;
        errorSources = Object.values(err.errors).map((el) => ({
            type: "ValidationError",
            details: el.message,
        }));
    }
    // Handle MongoDB Duplicate Key Error (code 11000)
    else if (err.code === 11000) {
        statusCode = http_status_1.default.BAD_REQUEST;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `Duplicate value error: ${field} already exists.`;
        errorSources = [{ type: "DuplicateKeyError", details: err.message }];
    }
    // Generic Error Handling
    else {
        errorSources = [{ type: "UnknownError", details: err.message || "An unexpected error occurred" }];
    }
    res.status(statusCode).json(Object.assign(Object.assign({ success: false, message }, (err instanceof ApiErrors_1.default && err.code ? { errorCode: err.code } : {})), { errorSources, stack: config_1.default.env === "development" ? err === null || err === void 0 ? void 0 : err.stack : undefined }));
};
exports.default = GlobalErrorHandler;
