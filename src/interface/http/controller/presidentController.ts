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
      result: quote,
    });
  });

  updatePresidentQuote = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const quote: IPresident = {
      name: req.body.name,
      quote: req.body.quote,
      details: req.body.details,
      designation: req.body.designation,
      image: req.body.image || undefined, // Image URL will be set by service if file is uploaded
    };
    const updatedQuote = await this.Service.updatePresidentQuote(id, quote, req.file);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "President quote updated successfully",
      result: updatedQuote,
    });
  });
}