import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";

export function validateCreateCommittee(body: Record<string, any>) {
  const {
    title,
    type,
    location,
    president,
  } = body;

  if (
    !title ||
    !type ||
    !location ||
    !president
  )
    throw new AppError(StatusCodes.BAD_REQUEST, "All fields are required");

  
}