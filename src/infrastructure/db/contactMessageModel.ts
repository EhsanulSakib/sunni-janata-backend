import mongoose from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface IContactMessage {
  name: string;
  email: string;
  message: string;
  seen?: boolean;
}

export interface IContactMessageDocument
  extends IContactMessage,
    mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactMessageModel
  extends mongoose.Model<IContactMessageDocument> {}

const contactMessageSchema = new mongoose.Schema<IContactMessageDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessageModel = mongoose.model<
  IContactMessageDocument,
  IContactMessageModel
>(
  DatabaseNames.ContactMessage,
  contactMessageSchema,
  DatabaseNames.ContactMessage
);

export default ContactMessageModel;
