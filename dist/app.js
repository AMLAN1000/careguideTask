"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const express_1 = __importDefault(require("express"));
const http_status_1 = __importDefault(require("http-status"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./app/routes"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
exports.corsOptions = {
    origin: true, // Allow all origins dynamically or we can set "*"
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(exports.corsOptions));
app.options("*", (0, cors_1.default)(exports.corsOptions));
const loggerFormat = ":method :url :status :res[content-length] - :response-time ms";
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(apiLimiter);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)(loggerFormat));
app.get("/", (req, res) => {
    res.send({
        success: true,
        statusCode: http_status_1.default.OK,
        message: "The Secure Note-Taking API is running!",
    });
});
// Central Router
app.use("/api/v1", routes_1.default);
// Error handling middleware
app.use(globalErrorHandler_1.default);
// Not found handler
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: "API NOT FOUND!",
        error: {
            path: req.originalUrl,
            message: "Your requested path is not found!",
        },
    });
});
exports.default = app;
