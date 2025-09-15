import { StatusCodes } from "http-status-codes";
import { IPresident } from "../../../infrastructure/db/presidentModel";
import { IPresidentService } from "../../../infrastructure/services/presidentService";
import catchAsync from "../../../shared/utils/catch_async";
import sendResponse from "../../../shared/utils/send_response";
import { Request, Response } from "express";

export default class PresidentController {
  Service: IPresidentService;

  constructor(service: IPresidentService) {
    this.Service = service;
  }

  getPresidentQuote = catchAsync(async (req: Request, res: Response) => {
    const quote = await this.Service.getPresidentQuote();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "President quote found successfully",
      result: quote
    });
  });

  updatePresidentQuote = catchAsync(async (req: Request, res: Response) => {
    const id = req.query.id as string;
    const quote = await this.Service.updatePresidentQuote(
      id,
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "President quote updated successfully",
      result: quote
    });
  });
}
