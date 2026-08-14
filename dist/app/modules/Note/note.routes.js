"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteRoutes = void 0;
const express_1 = __importDefault(require("express"));
const note_controller_1 = require("./note.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const note_validation_1 = require("./note.validation");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(note_validation_1.noteValidation.createNoteSchema), note_controller_1.noteController.createNote);
router.get("/", (0, auth_1.default)("USER", "ADMIN"), note_controller_1.noteController.getNoteList);
router.get("/:id", (0, auth_1.default)("USER", "ADMIN"), note_controller_1.noteController.getNoteById);
router.put("/:id", (0, auth_1.default)("USER", "ADMIN"), (0, validateRequest_1.default)(note_validation_1.noteValidation.updateNoteSchema), note_controller_1.noteController.updateNote);
router.delete("/:id", (0, auth_1.default)("USER", "ADMIN"), note_controller_1.noteController.deleteNote);
exports.noteRoutes = router;
