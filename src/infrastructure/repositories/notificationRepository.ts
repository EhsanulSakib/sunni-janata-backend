import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import {
  INotification,
  INotificationModel,
} from "../db/notificationModel";

export interface INotificationRepository {
  createNotification(notification: INotification): Promise<INotification>;
  getNotifications(): Promise<INotification[]>;
  updateNotification(id: string, notification: INotification): Promise<INotification>;
  deleteNotification(id: string): Promise<void>;
}

export default class NotificationRepository implements INotificationRepository {
  Model: INotificationModel;

  constructor(model: INotificationModel) {
    this.Model = model;
  }

  async createNotification(notification: INotification): Promise<INotification> {
    const newNotification = new this.Model(notification);
    return await newNotification.save();
  }

  async getNotifications(): Promise<INotification[]> {
    return await this.Model.find({
      expiry_at: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  async updateNotification(id: string, notification: INotification): Promise<INotification> {
    const updatedNotification = await this.Model.findByIdAndUpdate(id, notification, {
      new: true,
      runValidators: true,
    });

    if (!updatedNotification) {
      throw new AppError(StatusCodes.NOT_FOUND, `Notification not found`);
    }

    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<void> {
    const result = await this.Model.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, `Notification not found`);
    }
  }
}