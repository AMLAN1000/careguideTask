"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
// Scenario 1: Group users by interests (placed before parameterized :id route)
router.get("/by-interests", (0, auth_1.default)("USER", "ADMIN"), user_controller_1.userController.getUsersGroupedByInterests);
// Admin-only User Management CRUD routes
router.post("/", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(user_validation_1.userValidation.createUserSchema), user_controller_1.userController.createUser);
router.get("/", (0, auth_1.default)("ADMIN"), user_controller_1.userController.getUserList);
router.get("/:id", (0, auth_1.default)("ADMIN"), user_controller_1.userController.getUserById);
router.put("/:id", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(user_validation_1.userValidation.updateUserSchema), user_controller_1.userController.updateUser);
router.delete("/:id", (0, auth_1.default)("ADMIN"), user_controller_1.userController.deleteUser);
// Scenario 2: Retrieve all posts belonging to a particular user
router.get("/:id/posts", (0, auth_1.default)("USER", "ADMIN"), user_controller_1.userController.getUserPostsAggregation);
exports.userRoutes = router;
