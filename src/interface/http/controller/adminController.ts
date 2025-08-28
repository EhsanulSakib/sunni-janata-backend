import { Request, Response } from "express";
import catchAsync from "../../../shared/utils/catch_async";
import AppError from "../../../shared/errors/app_errors";
import { StatusCodes } from "http-status-codes";
import { IAdminService } from "../../../infrastructure/services/adminService";
import sendResponse from "../../../shared/utils/send_response";
import {
  validateCreateDesignation,
  validateUpdateDesignation,
} from "../validators/validateDesignation";

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

  createDesignation = catchAsync(async (req: Request, res: Response) => {
    validateCreateDesignation(req.body);
    const { title, level } = req.body;
    const result = await this.Service.createDesignation({ title, level });
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Designation created successfully",
      result,
    });
  });
  getDesignations = catchAsync(async (req: Request, res: Response) => {
    const result = await this.Service.getAllDesignation();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Designations fetched successfully",
      result,
    });
  });
  updateDesignation = catchAsync(async (req: Request, res: Response) => {
    validateUpdateDesignation(req.body);
    const { title, level } = req.body;
    const { desId } = req.params;
    const result = await this.Service.updateDesignation(desId, { title, level });
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Designation updated successfully",
      result,
    });
  });
  deleteDesignation = catchAsync(async (req: Request, res: Response) => {
    const { desId } = req.params;
    const result = await this.Service.deleteDesignation(desId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Designation deleted successfully",
      result,
    });
  });
  getDesignationDetails = catchAsync(async (req: Request, res: Response) => {
    const { desId } = req.params;
    const result = await this.Service.getDesignationById(desId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Designation details fetched successfully",
      result,
    });
  });
}
