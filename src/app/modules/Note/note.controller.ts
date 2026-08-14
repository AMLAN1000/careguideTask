import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Note } from "./note.model";
import { paginationHelper } from "../../../helpars/paginationHelper";
import ApiError from "../../../errors/ApiErrors";

const createNote = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  const newNote = await Note.create({
    title,
    content,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Note created successfully!",
    data: newNote,
  });
});

const getNoteList = catchAsync(async (req: Request & { user?: any }, res: Response) => {
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

  // Define filter conditions based on user role
  const filterConditions: { [key: string]: any } = {};
  if (req.user.role !== "ADMIN") {
    filterConditions.userId = req.user.id;
  }

  const result = await Note.find(filterConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate("userId", "email role"); // populate user info but not password

  const total = await Note.countDocuments(filterConditions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notes retrieved successfully!",
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  });
});

const getNoteById = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  const note = await Note.findById(id).populate("userId", "email role");

  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, "Note not found!");
  }

  // If the user is not an Admin, they can only view their own notes
  if (role !== "ADMIN" && note.userId._id.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access forbidden! You can only view your own notes.");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note retrieved successfully!",
    data: note,
  });
});

const updateNote = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, content } = req.body;

  const note = await Note.findById(id);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, "Note not found!");
  }

  // Only the owner can update their note
  if (note.userId.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access forbidden! You can only update your own notes.");
  }

  if (title) note.title = title;
  if (content) note.content = content;
  await note.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note updated successfully!",
    data: note,
  });
});

const deleteNote = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const note = await Note.findById(id);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, "Note not found!");
  }

  // Only the owner can delete their note
  if (note.userId.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access forbidden! You can only delete your own notes.");
  }

  await Note.findByIdAndDelete(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note deleted successfully!",
    data: note,
  });
});

export const noteController = {
  createNote,
  getNoteList,
  getNoteById,
  updateNote,
  deleteNote,
};
