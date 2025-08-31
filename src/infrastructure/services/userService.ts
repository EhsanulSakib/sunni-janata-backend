import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { ApproveStatus, CloudinaryFolders } from "../../shared/utils/enums";
import { IUser, IUserDocument } from "../db/userModel";
import { IUserRepository } from "../repositories/userRepository";
import { UserPolicy } from "../policies/userPolicies";
import bcrypt from "bcrypt";
import { uploadFileToCloudinary } from "../../shared/utils/cloudinary_file_operations";
import {
  isVideoFile,
  otpStatusCodeToMessage,
} from "../../shared/utils/helper_functions";
import axios from "axios";
import { ReturnDocument } from "mongodb";

export interface IUserService {
  requestRegistration(
    data: IUser,
    avatar?: Express.Multer.File
  ): Promise<IUserDocument>;
  requestOTP(phone: string): Promise<{ message: string }>;
  verifyOTP(phone: string, otp: number): Promise<boolean>;
  //   updateAccountStatus(
  //     id: string,
  //     status: ApproveStatus
  //   ): Promise<IUserDocument>;
}

export default class UserService implements IUserService {
  UserRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.UserRepository = userRepository;
  }

  async requestRegistration(
    data: IUser,
    avatar?: Express.Multer.File
  ): Promise<IUserDocument> {
    // validating
    await UserPolicy.ensureUserCanRegister(this.UserRepository, data);
    // creating document
    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(process.env.SALT_ROUND || 15)
    );
    if (avatar) {
      const url = await uploadFileToCloudinary({
        file: avatar,
        folder: CloudinaryFolders.User,
        isVideo: isVideoFile(avatar.originalname),
      });
      data.avatar = url;
    }
    data.password = hashedPassword;
    const newUser = await this.UserRepository.createUser(data);
    return newUser;
  }

  async requestOTP(phone: string): Promise<{ message: string }> {
    await UserPolicy.ensureCanGetOTP(this.UserRepository, phone);
    const otpNumber = Math.floor(100000 + Math.random() * 900000);
    const getUser = await this.UserRepository.getUserByPhone(phone);
    await this.UserRepository.updateUser(getUser?._id as string, {
      otp: otpNumber,
    });
    const msgBody = {
      api_key: process.env.SMS_API_KEY,
      senderid: process.env.SMS_SENDER_ID,
      number: phone,
      message: `Your Sunni Janata Platform OTP is ${otpNumber}`,
    };
    let code = 202;
    try {
      const res = await axios.post("http://bulksmsbd.net/api/smsapi", msgBody);
      console.log(res.data);
      code = res.data.response_code;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "SMS sending failed"
      );
    }
    return { message: otpStatusCodeToMessage(code) };
  }

  async verifyOTP(phone: string, otp: number): Promise<boolean> {
    await UserPolicy.ensureCanGetOTP(this.UserRepository, phone);
    const profile = await this.UserRepository.getUserByPhone(phone);
    if (otp == profile?.otp)
      await this.UserRepository.updateUser(profile._id as string, {
        verifiedUser: true,
      });
    else throw new AppError(StatusCodes.BAD_REQUEST, "wrong otp");
    return true;
  }
}
