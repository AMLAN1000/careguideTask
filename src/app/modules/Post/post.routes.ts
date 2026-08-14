import express from "express";
import { postController } from "./post.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { postValidation } from "./post.validation";

const router = express.Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(postValidation.createPostSchema),
  postController.createPost
);

router.get(
  "/",
  postController.getPostList
);

export const postRoutes = router;
