import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";
import { ApproveStatus } from "../../../shared/utils/enums";

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

export function validateLogin(body: Record<string, any>) {
  const { phone, password } = body;
  if (!phone || !password)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "phone and passwords are required fields"
    );
}

export function validateStatus(status: any) {
  if (!status)
    throw new AppError(StatusCodes.BAD_REQUEST, "filed status is required");
  if (!Object.values(ApproveStatus).includes(status as ApproveStatus))
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `${status} is not a valid status`
    );
}

export function validateChangePassword(body: Record<string, any>) {
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "oldPassword and newPassword are required fields"
    );
}

export function validateForgetPassword(body: Record<string, any>) {
  const { phone, newPassword, otp } = body;
  if (!phone)
    throw new AppError(StatusCodes.BAD_REQUEST, "phone is required field");
  if (!newPassword)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "newPassword is required field"
    );
  if (!otp)
    throw new AppError(StatusCodes.BAD_REQUEST, "otp is required field");
}
