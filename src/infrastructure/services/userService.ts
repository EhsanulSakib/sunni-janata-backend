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
import { IPagination } from "../../shared/utils/query_builder";
import jwt from "jsonwebtoken";
import { appendFile } from "fs";
import OTPHandler from "../handlers/otpHandler";
import { ILocationRepository } from "../repositories/locationRepository";
import { ICommitteeRepository } from "../repositories/committeeRepository";
import { LocationCommitteePolicty } from "../policies/locationCommitteePolicy";
import { IDesignationRepository } from "../repositories/designationRepository";
import DesignationPolicy from "../policies/designationPolicy";

export interface IUserService {
  requestRegistration(
    data: IUser,
    avatar?: Express.Multer.File
  ): Promise<IUserDocument>;
  requestOTP(phone: string): Promise<{ message: string }>;
  verifyOTP(phone: string, otp: number): Promise<boolean>;
  updateAccountStatus(
    id: string,
    status: ApproveStatus
  ): Promise<IUserDocument>;
  getUsersByStatus(
    status: ApproveStatus,
    query: Record<string, any>
  ): Promise<{ pagination: IPagination; users: IUserDocument[] }>;
  userLogin(
    phone: string,
    password: string
  ): Promise<{ result: IUserDocument; token: string }>;
  changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<IUserDocument>;
  forgetPassword(
    phone: string,
    otp: number,
    newPassword: string
  ): Promise<IUserDocument>;
  getProfile(id: string): Promise<IUserDocument>;
  assignCommitteeDesignation(
    userId: string,
    designation: string,
    committee: string
  ): Promise<IUserDocument>;
}

export default class UserService implements IUserService {
  UserRepository: IUserRepository;
  LocationRepository: ILocationRepository;
  CommitteeRepository: ICommitteeRepository;
  DesignationRepository: IDesignationRepository;

  constructor(
    userRepository: IUserRepository,
    locationRepository: ILocationRepository,
    committeeRepository: ICommitteeRepository,
    designationRepository: IDesignationRepository
  ) {
    this.UserRepository = userRepository;
    this.LocationRepository = locationRepository;
    this.CommitteeRepository = committeeRepository;
    this.DesignationRepository = designationRepository;
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

    const message = `Your Sunni Janata Party OTP is ${otpNumber}`;
    const oTPHandler = new OTPHandler();
    const res = await oTPHandler.sendSmsOTP(phone, message);
    return res;
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

  async updateAccountStatus(
    id: string,
    status: ApproveStatus
  ): Promise<IUserDocument> {
    await UserPolicy.ensureUpdateProfile(this.UserRepository, id);
    return await this.UserRepository.updateUser(id, {
      accountStatus: status,
    });
  }

  async getUsersByStatus(
    status: ApproveStatus,
    query: Record<string, any>
  ): Promise<{ pagination: IPagination; users: IUserDocument[] }> {
    const result = await this.UserRepository.getUsersByStatus(status, query);
    return result;
  }

  async userLogin(
    phone: string,
    password: string
  ): Promise<{ result: IUserDocument; token: string }> {
    await UserPolicy.ensureUserLogin(this.UserRepository, phone);
    const user = await this.UserRepository.getUserByPhone(phone);
    const passwordMatched = await bcrypt.compare(
      password,
      user?.password as string
    );
    if (!passwordMatched)
      throw new AppError(StatusCodes.BAD_REQUEST, "wrong password");
    // prepare token
    const secret = process.env.JWT_SECRET || "jwt_secret";
    const payload = {
      id: user?._id,
      phone: user?.phone,
      role: user?.role,
      designation: user?.assignedPosition,
    };
    const token = jwt.sign(payload, secret);
    return { result: user!, token };
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<IUserDocument> {
    await UserPolicy.ensureUpdateProfile(this.UserRepository, id);
    const user = await this.UserRepository.getUserById(id);
    const passwordMatched = await bcrypt.compare(
      oldPassword,
      user?.password as string
    );
    if (!passwordMatched)
      throw new AppError(StatusCodes.BAD_REQUEST, "wrong password");
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_ROUND || 15)
    );
    return await this.UserRepository.updateUser(id, {
      password: hashedPassword,
    });
  }

  async forgetPassword(
    phone: string,
    otp: number,
    newPassword: string
  ): Promise<IUserDocument> {
    await UserPolicy.ensureCanGetOTP(this.UserRepository, phone);
    const user = await this.UserRepository.getUserByPhone(phone);
    if (otp != user?.otp)
      throw new AppError(StatusCodes.BAD_REQUEST, "wrong otp");
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_ROUND || 15)
    );
    return await this.UserRepository.updateUser(user?._id as string, {
      password: hashedPassword,
    });
  }

  async getProfile(id: string): Promise<IUserDocument> {
    const user = await this.UserRepository.getUserById(id);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "user not found");
    return user;
  }

  async assignCommitteeDesignation(
    userId: string,
    designation: string,
    committee: string
  ): Promise<IUserDocument> {
    const existingCommittee = await LocationCommitteePolicty.ensureCommittee(
      this.CommitteeRepository,
      committee
    );
    const assignedDesignation = await DesignationPolicy.ensureDesignnation(
      this.DesignationRepository,
      designation
    );

    if (existingCommittee.president && assignedDesignation.level == 1)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "committee already has a president"
      );

    await UserPolicy.ensureUserExistance(this.UserRepository, userId);
    return await this.UserRepository.updateUser(userId, {
      assignedPosition: designation,
      assignedCommittee: committee,
    });
  }
}
