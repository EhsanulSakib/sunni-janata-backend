// infrastructure/db/notificationModel.ts (New File)
import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  title: string;
  description: string;
  expiry_at: Date;
  createdAt: Date;
}

export interface INotificationModel extends Model<INotification> {}

const NotificationSchema: Schema<INotification> = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [150, "Description cannot exceed 150 characters"],
  },
  expiry_at: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default to 3 days from now
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index for automatic deletion after expiry_at
NotificationSchema.index({ expiry_at: 1 }, { expireAfterSeconds: 0 });

const NotificationModel = mongoose.model<INotification, INotificationModel>(
  "Notification",
  NotificationSchema
);

export default NotificationModel;