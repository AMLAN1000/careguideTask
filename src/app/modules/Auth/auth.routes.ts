import express from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";

const router = express.Router();

router.post(
  "/register",
  validateRequest(authValidation.registerSchema),
  AuthController.registerUser
);

router.post(
  "/login",
  validateRequest(authValidation.loginSchema),
  AuthController.loginUser
);

export const AuthRoutes = router;