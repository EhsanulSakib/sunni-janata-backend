import { INotification } from "../db/notificationModel";
import { INotificationRepository } from "../repositories/notificationRepository";

export interface INotificationService {
  createNotification(notification: INotification): Promise<INotification>;
  getNotifications(): Promise<INotification[]>;
  updateNotification(id: string, notification: INotification): Promise<INotification>;
  deleteNotification(id: string): Promise<void>;
}

export class NotificationService implements INotificationService {
  NotificationRepository: INotificationRepository;

  constructor(NotificationRepository: INotificationRepository) {
    this.NotificationRepository = NotificationRepository;
  }

  async createNotification(notification: INotification): Promise<INotification> {
    if (!notification.expiry_at) {
      notification.expiry_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }
    return await this.NotificationRepository.createNotification(notification);
  }

  async getNotifications(): Promise<INotification[]> {
    return await this.NotificationRepository.getNotifications();
  }

  async updateNotification(id: string, notification: INotification): Promise<INotification> {
    if (!notification.expiry_at) {
      notification.expiry_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }
    return await this.NotificationRepository.updateNotification(id, notification);
  }

  async deleteNotification(id: string): Promise<void> {
    return await this.NotificationRepository.deleteNotification(id);
  }
}