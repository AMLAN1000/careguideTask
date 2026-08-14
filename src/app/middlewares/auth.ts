import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiErrors";
import { jwtHelpers } from "../../helpars/jwtHelpers";
import { User } from "../modules/User/user.model";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!", "UNAUTHORIZED");
      }

      // Handle Bearer prefix if present
      const tokenParts = token.split(" ");
      const actualToken = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

      const verifiedUser = jwtHelpers.verifyToken(
        actualToken,
        config.jwt.jwt_secret as Secret
      );
      const { id, role } = verifiedUser;

      // Check if user exists in DB
      const user = await User.findById(id);

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!", "USER_NOT_FOUND");
      }

      req.user = verifiedUser as JwtPayload;

      // Role-based access
      if (roles.length && !roles.includes(role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!", "FORBIDDEN");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
