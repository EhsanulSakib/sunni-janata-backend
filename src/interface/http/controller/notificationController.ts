import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { INotificationService } from "../../../infrastructure/services/notificationService";
import catchAsync from "../../../shared/utils/catch_async";
import { INotification } from "../../../infrastructure/db/notificationModel";
import sendResponse from "../../../shared/utils/send_response";

export default class NotificationController {
  Service: INotificationService;

  constructor(service: INotificationService) {
    this.Service = service;
  }

  createNotification = catchAsync(async (req: Request, res: Response) => {
    const notification: INotification = req.body;
    const newNotification = await this.Service.createNotification(notification);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Notification created successfully",
      result: newNotification,
    });
  });

  getNotifications = catchAsync(async (req: Request, res: Response) => {
    const notifications = await this.Service.getNotifications();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Notifications fetched successfully",
      result: notifications,
    });
  });

  updateNotification = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const notification: INotification = req.body;
    const updatedNotification = await this.Service.updateNotification(id, notification);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Notification updated successfully",
      result: updatedNotification,
    });
  });

  deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await this.Service.deleteNotification(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Notification deleted successfully",
      result: null,
    });
  });
}