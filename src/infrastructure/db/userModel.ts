import mongoose from "mongoose";

export interface IUser {
  fullName: string;
  email: string;
  phone: string;
  dob: Date;
  division: mongoose.Schema.Types.ObjectId;
  district: mongoose.Schema.Types.ObjectId;
  subDistrict: mongoose.Schema.Types.ObjectId;
  union: mongoose.Schema.Types.ObjectId;
  ward: mongoose.Schema.Types.ObjectId;
  memberPosition: mongoose.Schema.Types.ObjectId;
  inspiration: string;
}

export interface IUserDocument extends IUser, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends mongoose.Model<IUserDocument> {}
