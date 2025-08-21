import { Response, NextFunction, Request } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";

export const customValidateFileResponse = ({
  isvideo,
}: { 
  isvideo: boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      // return next(new Error("File is missing in the request."));
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "File is missing in the request"
      );
    }

    if (isvideo && req.file.mimetype !== "video/mp4") {
      // return next(new Error("File must be a video."));
      throw new AppError(StatusCodes.BAD_REQUEST, "File must be a video");
    }

    next();
  };
};
