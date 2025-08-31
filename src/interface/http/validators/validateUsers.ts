import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";

export function validateAccountRequest(body: Record<string, any>) {
  const {
    fullName,
    phone,
    password,
    dob,
    division,
    district,
    upazila,
    union,
    ward,
    requestedPosition,
    inspiration,
  } = body;

  if (
    !fullName ||
    !phone ||
    !password ||
    !dob ||
    !division ||
    !district ||
    !upazila ||
    !union ||
    !ward ||
    !requestedPosition ||
    !inspiration
  )
    throw new AppError(StatusCodes.BAD_REQUEST, "All fields are required");
}
