import { Request, Response } from "express";
import catchAsync from "../../../shared/utils/catch_async";
import { IUser } from "../../../infrastructure/db/userModel";
import { IUserService } from "../../../infrastructure/services/userService";
import { validateAccountRequest } from "../validators/validateUsers";
import sendResponse from "../../../shared/utils/send_response";
import { StatusCodes } from "http-status-codes";

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
  })
}
