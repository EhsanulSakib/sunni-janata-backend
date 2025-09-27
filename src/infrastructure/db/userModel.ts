import mongoose from "mongoose";
import {
  ApproveStatus,
  DatabaseNames,
  UserRoles,
} from "../../shared/utils/enums";

export interface IUser {
  user_id?: string;
  fullName: string;
  email?: string;
  phone: string;
  avatar?: string;
  password: string;
  dob: Date;
  division: string;
  district: string;
  upazila: string;
  thana: string;
  union: string;
  ward: string;
  requestedPosition: string;
  assignedPosition: mongoose.Schema.Types.ObjectId | string | null;
  assignedCommittee: mongoose.Schema.Types.ObjectId | string | null;
  inspiration: string;
  role: string;
  accountStatus?: ApproveStatus;
  verifiedUser?: boolean;
  otp?: number;
}

export interface IUserDocument extends IUser, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends mongoose.Model<IUserDocument> {}

// Function to generate a 6-digit user_id synchronously
const generateUserId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    user_id: { 
      type: String, 
      required: true, 
      unique: true,
      default: generateUserId
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    avatar: { type: String },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    thana: { type: String, required: true },
    union: { type: String, required: true },
    ward: { type: String, required: true },
    requestedPosition: { type: String, required: true },
    assignedPosition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DatabaseNames.Designation,
      default: null,
    },
    assignedCommittee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DatabaseNames.Committee,
      default: null,
    },
    role: { type: String, enum: UserRoles, default: UserRoles.User },
    inspiration: { type: String, required: true },
    accountStatus: { type: String, default: ApproveStatus.Pending },
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