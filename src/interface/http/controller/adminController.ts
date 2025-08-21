import { Request, Response } from "express";
import catchAsync from "../../../shared/utils/catch_async";
import AppError from "../../../shared/errors/app_errors";
import { StatusCodes } from "http-status-codes";
import { IAdminService } from "../../../infrastructure/services/adminService";
import { access } from "fs";
import sendResponse from "../../../shared/utils/send_response";

export default class AdminController {
  Service: IAdminService;
  constructor(adminService: IAdminService) {
    this.Service = adminService;
  }
  register = catchAsync(async (req: Request, res: Response) => {
    const { userId, password } = req.body;
    if (!userId || !password)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "UserId, password are required"
      );
    if (isNaN(Number(userId)))
      throw new AppError(StatusCodes.BAD_REQUEST, "UserId must be a number");
    
    const admin = await this.Service.register({ userId, password });
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Admin registered successfully",
      result: admin,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { userId, password } = req.body;
    if (!userId || !password)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "UserId and password are required"
      );
    if (isNaN(Number(userId)))
      throw new AppError(StatusCodes.BAD_REQUEST, "UserId must be a number");
    const { data, token } = await this.Service.login(userId, password);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Admin logged in successfully",
      result: data,
      access_token: token,
    });
  });

  changePassword = catchAsync(async (req: Request, res: Response) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "UserId, oldPassword and newPassword are required"
      );
    if (isNaN(Number(userId)))
      throw new AppError(StatusCodes.BAD_REQUEST, "UserId must be a number");
    const admin = await this.Service.update(userId, oldPassword, newPassword);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password changed successfully",
      result: admin,
    });
  });

  getNumbers = catchAsync(async (req: Request, res: Response) => {
    throw new AppError(StatusCodes.CONTINUE, "not implemented");
  });

  getAccountRequests = catchAsync(async (req: Request, res: Response) => {
    throw new AppError(StatusCodes.CONTINUE, "not implemented");
  });
  markAccountRequestsRead = catchAsync(async (req: Request, res: Response) => {
    throw new AppError(StatusCodes.CONTINUE, "not implemented");
  });
}
