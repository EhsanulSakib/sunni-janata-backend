import { StatusCodes } from "http-status-codes";
import { IUser, IUserDocument } from "../db/userModel";
import { IUserRepository } from "../repositories/userRepository";
import AppError from "../../shared/errors/app_errors";
import { ApproveStatus } from "../../shared/utils/enums";
import { ClientSession } from "mongoose";

export class UserPolicy {
  static async ensureUserCanRegister(
    UserRepository: IUserRepository,
    data: IUser
  ) {
    // checking for unique phone number
    const existingPhone = await UserRepository.getUserByPhone(data.phone);
    if (existingPhone && existingPhone.verifiedUser)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `${data.phone} is already registered`
      );
    if (existingPhone)
      await UserRepository.deleteUser(existingPhone._id as string); // deleting garbage requests
    // checking for unique email
    // const existingEmail = await UserRepository.getUserByEmail(data.email!);
    // if (existingEmail && existingEmail.verifiedUser)
    //   throw new AppError(
    //     StatusCodes.BAD_REQUEST,
    //     `${data.email} is already registered`
    //   );
    // if (existingEmail)
    //   await UserRepository.deleteUser(existingEmail._id as string); // deleting garbage requests
  }

  static async ensureCanGetOTP(UserRepository: IUserRepository, phone: string) {
    const existingUser = await UserRepository.getUserByPhone(phone);
    if (!existingUser)
      throw new AppError(StatusCodes.BAD_REQUEST, `${phone} is not registered`);
  }

  static async ensureUpdateProfile(
    UserRepository: IUserRepository,
    id: string
  ) {
    const existingUser = await UserRepository.getUserById(id);
    if (!existingUser?.verifiedUser)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `This account is not verified`
      );
    if (!existingUser)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `This account does not exists`
      );
  }

  static async ensureUserLogin(UserRepository: IUserRepository, phone: string) {
    const user = await UserRepository.getUserByPhone(phone);
    if (!user)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `an account with ${phone} is not registered`
      );
    if (!user.verifiedUser)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `user with ${phone} is not verified`
      );

    if (user.accountStatus !== ApproveStatus.Approved)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `user with ${phone} is not approved`
      );
    return user;
  }

  static async ensureUserExistance(
    UserRepository: IUserRepository,
    id: string,
    session?: ClientSession
  ): Promise<IUserDocument> {
    const user = await UserRepository.getUserById(id, session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    return user;
  }
}