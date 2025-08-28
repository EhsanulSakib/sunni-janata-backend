import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";
import { LocationLevels } from "../../../shared/utils/enums";

export function validateCreateLocation(body: Record<string, any>) {
  const { title, level, parentLocation } = body;
  if (!title) throw new AppError(StatusCodes.BAD_REQUEST, "title is required");
  if (!level) throw new AppError(StatusCodes.BAD_REQUEST, "level is required");
  if (!Object.values(LocationLevels).includes(level))
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `type ${level} is not valid Type`
    );
}


export function validateEditLocation(body: Record<string, any>) {
  const { title, level } = body;
  if(!title && !level) throw new AppError(StatusCodes.BAD_REQUEST, "Nothing to update");
  if (level && !Object.values(LocationLevels).includes(level))
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `type ${level} is not valid Type`
    );
}

