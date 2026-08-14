import { Request, Response } from "express";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { User } from "../User/user.model";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { Secret } from "jsonwebtoken";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password, role, interests } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User with this email already exists!");
  }

  // Hash password
  const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    role: role || "USER",
    interests: interests || [],
  });

  // Exclude password from the returned object
  const userResult = {
    _id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    interests: newUser.interests,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully!",
    data: userResult,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Compare password
  const isPasswordMatch = await bcrypt.compare(password, user.password as string);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect password!");
  }

  // Generate token
  const tokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      accessToken,
    },
  });
});

export const AuthController = {
  registerUser,
  loginUser,
};
