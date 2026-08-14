import { Request, Response } from "express";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import mongoose from "mongoose";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { User } from "./user.model";
import { paginationHelper } from "../../../helpars/paginationHelper";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password, role, interests } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User with this email already exists!");
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    role: role || "USER",
    interests: interests || [],
  });

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
    message: "User created successfully by admin!",
    data: userResult,
  });
});

const getUserList = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
  };

  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(paginationOptions);

  const sortConditions: { [key: string]: any } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sortConditions["createdAt"] = -1;
  }

  const result = await User.find()
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User list retrieved successfully!",
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User profile not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully!",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = { ...req.body };

  if (payload.password) {
    const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
    payload.password = await bcrypt.hash(payload.password, saltRounds);
  }

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found to update!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: updatedUser,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found to delete!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully!",
    data: deletedUser,
  });
});

// Scenario 1: Group Users by Interests using a single collection.aggregate() call
const getUsersGroupedByInterests = catchAsync(async (req: Request, res: Response) => {
  const result = await User.aggregate([
    {
      $unwind: "$interests",
    },
    {
      $group: {
        _id: "$interests",
        users: {
          $push: {
            _id: "$_id",
            email: "$email",
          },
        },
      },
    },
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users grouped by interests retrieved successfully!",
    data: result,
  });
});

// Scenario 2: Retrieve posts belonging to a user using $lookup in a single aggregation pipeline
const getUserPostsAggregation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID format");
  }

  const result = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "posts", // Name of MongoDB posts collection
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },
  ]);

  if (!result.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User posts retrieved successfully via lookup!",
    data: result[0],
  });
});

export const userController = {
  createUser,
  getUserList,
  getUserById,
  updateUser,
  deleteUser,
  getUsersGroupedByInterests,
  getUserPostsAggregation,
};
