import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Post } from "./post.model";
import { paginationHelper } from "../../../helpars/paginationHelper";

const createPost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  const newPost = await Post.create({
    title,
    content,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully!",
    data: newPost,
  });
});

const getPostList = catchAsync(async (req: Request, res: Response) => {
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

  const result = await Post.find()
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate("userId", "email role");

  const total = await Post.countDocuments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully!",
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  });
});

export const postController = {
  createPost,
  getPostList,
};
