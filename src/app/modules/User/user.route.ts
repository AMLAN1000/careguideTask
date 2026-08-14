import express from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";

const router = express.Router();

// Scenario 1: Group users by interests (placed before parameterized :id route)
router.get(
  "/by-interests",
  auth("USER", "ADMIN"),
  userController.getUsersGroupedByInterests
);

// Admin-only User Management CRUD routes
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(userValidation.createUserSchema),
  userController.createUser
);

router.get(
  "/",
  auth("ADMIN"),
  userController.getUserList
);

router.get(
  "/:id",
  auth("ADMIN"),
  userController.getUserById
);

router.put(
  "/:id",
  auth("ADMIN"),
  validateRequest(userValidation.updateUserSchema),
  userController.updateUser
);

router.delete(
  "/:id",
  auth("ADMIN"),
  userController.deleteUser
);

// Scenario 2: Retrieve all posts belonging to a particular user
router.get(
  "/:id/posts",
  auth("USER", "ADMIN"),
  userController.getUserPostsAggregation
);

export const userRoutes = router;
