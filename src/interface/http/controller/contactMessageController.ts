import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";
import catchAsync from "../../../shared/utils/catch_async";
import { Request, Response } from "express";
import { IContactMessageService } from "../../../infrastructure/services/contactMessageService";
import sendResponse from "../../../shared/utils/send_response";

export default class ContactMessageController {
  Service: IContactMessageService;

  constructor(service: IContactMessageService) {
    this.Service = service;
  }

  sendContactMessage = catchAsync(async (req: Request, res: Response) => {
    const { name, email, message } = req.body;
    const newMessage = await this.Service.create({ name, email, message });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Contact message sent successfully",
      result: newMessage,
    });
  });

  getAllContactMessages = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const messages = await this.Service.getAll(query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Contact messages retrieved successfully",
      result: messages,
    });
  });
  markContactMessagesRead = catchAsync(async (req: Request, res: Response) => {
    const result = await this.Service.markRead();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Contact messages marked as read successfully",
      result: result,
    });
  });
  deleteContactMessage = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.Service.delete(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Contact messages deleted successfully",
      result: result,
    });
  });
  getContactMessageDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.Service.getById(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Contact messages details retrieved successfully",
      result: result,
    });
  });
}
