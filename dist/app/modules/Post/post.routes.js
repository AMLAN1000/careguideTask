"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
const express_1 = __importDefault(require("express"));
const post_controller_1 = require("./post.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const post_validation_1 = require("./post.validation");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(post_validation_1.postValidation.createPostSchema), post_controller_1.postController.createPost);
router.get("/", post_controller_1.postController.getPostList);
exports.postRoutes = router;
