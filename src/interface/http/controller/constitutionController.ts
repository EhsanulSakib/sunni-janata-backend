import { StatusCodes } from "http-status-codes";
import { IConstitution } from "../../../infrastructure/db/constitutionModel";
import { IConstitutionService } from "../../../infrastructure/services/constitutionService";
import catchAsync from "../../../shared/utils/catch_async";
import sendResponse from "../../../shared/utils/send_response";
import { Request, Response } from "express";
import AppError from "../../../shared/errors/app_errors";

export default class ConstitutionController {
  Service: IConstitutionService;

  constructor(service: IConstitutionService) {
    this.Service = service;
  }

  getConstitution = catchAsync(async (req: Request, res: Response) => {
    const constitution = await this.Service.getConstitution();
    if (!constitution) {
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "No constitution found",
        result: { url: null },
      });
    } else {
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Constitution found successfully",
        result: { url: constitution.url },
      });
    }
  });

  updateConstitution = catchAsync(async (req: Request, res: Response) => {
    if (!req.file || req.file.mimetype !== "application/pdf") {
      throw new AppError(StatusCodes.BAD_REQUEST, "PDF file is required for upload");
    }
    const updatedConstitution = await this.Service.updateConstitution(req.file);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Constitution updated successfully",
      result: { url: updatedConstitution.url },
    });
  });
}