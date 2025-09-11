import { Request, Response } from "express";
import catchAsync from "../../../shared/utils/catch_async";
import { IUser } from "../../../infrastructure/db/userModel";
import { IUserService } from "../../../infrastructure/services/userService";
import {
  validateAccountRequest,
  validateChangePassword,
  validateForgetPassword,
  validateLogin,
  validateStatus,
} from "../validators/validateUsers";
import sendResponse from "../../../shared/utils/send_response";
import { StatusCodes } from "http-status-codes";
import { Query } from "mongoose";
import { ApproveStatus } from "../../../shared/utils/enums";
import { checkFieldsExistence } from "../../../shared/utils/helper_functions";

export default class UserController {
  Service: IUserService;
  constructor(service: IUserService) {
    this.Service = service;
  }

  requestRegistration = catchAsync(async (req: Request, res: Response) => {
    validateAccountRequest(req.body);
    const result = await this.Service.requestRegistration(req.body, req.file);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Registration request sent successfully",
      result: result,
    });
  });

  requestOtp = catchAsync(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) throw new Error("Phone number is required");
    const result = await this.Service.requestOTP(phone);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `OTP sent successfully sent to ${phone} number`,
      result: result,
    });
  });

  verifyOtp = catchAsync(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    if (!phone) throw new Error("Phone number is required");
    if (!otp) throw new Error("OTP is required");
    const result = await this.Service.verifyOTP(phone, otp);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `OTP verified successfully`,
      result: result,
    });
  });

  updateAccountStatus = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body;
    validateStatus(status);
    const result = await this.Service.updateAccountStatus(
      req.params.id,
      status
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `User status updated to ${status} successfully`,
      result: result,
    });
  });

  getAccountsByStatus = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.params;
    validateStatus(status);
    const result = await this.Service.getUsersByStatus(
      status as ApproveStatus,
      req.query
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `Users with status ${status} fetched successfully`,
      result: result,
    });
  });

  loginUser = catchAsync(async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    validateLogin(req.body);
    const { result, token } = await this.Service.userLogin(phone, password);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `User logged in successfully`,
      result: result,
      access_token: token,
    });
  });
  changePassword = catchAsync(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    validateChangePassword(req.body);
    const result = await this.Service.changePassword(
      req.user!.id,
      oldPassword,
      newPassword
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `Password changed successfully`,
      result: result,
    });
  });
  forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { phone, otp, newPassword } = req.body;
    validateForgetPassword(req.body);
    const result = await this.Service.forgetPassword(phone, otp, newPassword);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `Password changed successfully`,
      result: result,
    });
  });

  getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await this.Service.getProfile(req.user!.id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `Profile fetched successfully`,
      result: result,
    });
  });

  getProfileWithId = catchAsync(async (req: Request, res: Response) => {
    const result = await this.Service.getProfile(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `Profile fetched successfully`,
      result: result,
    });
  });

  assignCommitteeDesignation = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.params
    const {designation, committee} = req.body;
    checkFieldsExistence({designation, committee});
    const result = await this.Service.assignCommitteeDesignation(userId, designation, committee);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `User assigned to committee and designation successfully`,
      result: result,
    });
    
  });
  
}
