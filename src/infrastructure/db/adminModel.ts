import e from "express";
import mongoose from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface IAdmin {
  title: "Admin";
  userId: number;
  password: string;
  role: string;
}

export interface IAdminDocument extends IAdmin, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminModel extends mongoose.Model<IAdminDocument> {}

const adminSchema = new mongoose.Schema<IAdminDocument>(
  {
    title: {
      type: String,
      required: true,
      default: "Admin",
    },
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

const AdminModel = mongoose.model<IAdminDocument, IAdminModel>(
  DatabaseNames.Admin,
  adminSchema,
  DatabaseNames.Admin
);

export default AdminModel;