import mongoose from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface IUser {
  fullName: string;
  email: string;
  phone: string;
  dob: Date;
  division: string;
  district: string;
  subDistrict: string;
  union: string;
  ward: string;
  requestedPosition: string;
  inspiration: string;
  verifiedUser?: boolean;
  otp?: number;
}

export interface IUserDocument extends IUser, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends mongoose.Model<IUserDocument> {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    subDistrict: { type: String, required: true },
    union: { type: String, required: true },
    ward: { type: String, required: true },
    requestedPosition: { type: String, required: true },
    inspiration: { type: String, required: true },
    verifiedUser: { type: Boolean, default: false },
    otp: { type: Number },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUserDocument, IUserModel>(
  DatabaseNames.User,
  userSchema,
  DatabaseNames.User
);

export default UserModel;
