import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";

export function validateCreateDesignation(body: Record<string, string>) {
  const { title, level } = body;
  if (!title || !level)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "title and level are required fields"
    );
  if (isNaN(Number(level)))
    throw new AppError(StatusCodes.BAD_REQUEST, "level must be a number");
  if (Number(level) < 0)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "level must be a positive number"
    );
}

export function validateUpdateDesignation(body: Record<string, string>) {
  const { title, level } = body;
  if (!title && !level)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Nothing to update"
    );
  if (isNaN(Number(level)))
    throw new AppError(StatusCodes.BAD_REQUEST, "level must be a number");
  if (Number(level) < 0)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "level must be a positive number"
    );
}
