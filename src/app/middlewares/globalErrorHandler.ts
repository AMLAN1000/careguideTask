import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import handleZodError from "../../errors/handleZodError";
import ApiError from "../../errors/ApiErrors";
import config from "../../config";

const GlobalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let errorSources: any[] = [];

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Handle Custom ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ type: "ApiError", details: err.message }];
  }
  // Handle Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = `Invalid ID format for: ${err.path}`;
    errorSources = [{ type: "CastError", details: err.message }];
  }
  // Handle Mongoose ValidationError
  else if (err.name === "ValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = err.message;
    errorSources = Object.values(err.errors).map((el: any) => ({
      type: "ValidationError",
      details: el.message,
    }));
  }
  // Handle MongoDB Duplicate Key Error (code 11000)
  else if (err.code === 11000) {
    statusCode = httpStatus.BAD_REQUEST;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value error: ${field} already exists.`;
    errorSources = [{ type: "DuplicateKeyError", details: err.message }];
  }
  // Generic Error Handling
  else {
    errorSources = [{ type: "UnknownError", details: err.message || "An unexpected error occurred" }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof ApiError && err.code ? { errorCode: err.code } : {}),
    errorSources,
    stack: config.env === "development" ? err?.stack : undefined,
  });
};

export default GlobalErrorHandler;
