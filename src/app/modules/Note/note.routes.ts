import express from "express";
import { noteController } from "./note.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { noteValidation } from "./note.validation";

const router = express.Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(noteValidation.createNoteSchema),
  noteController.createNote
);

router.get(
  "/",
  auth("USER", "ADMIN"),
  noteController.getNoteList
);

router.get(
  "/:id",
  auth("USER", "ADMIN"),
  noteController.getNoteById
);

router.put(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(noteValidation.updateNoteSchema),
  noteController.updateNote
);

router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  noteController.deleteNote
);

export const noteRoutes = router;
