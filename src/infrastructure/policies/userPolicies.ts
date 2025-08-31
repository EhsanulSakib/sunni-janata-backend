import { StatusCodes } from "http-status-codes";
import { IUser } from "../db/userModel";
import { IUserRepository } from "../repositories/userRepository";
import AppError from "../../shared/errors/app_errors";

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
    const existingEmail = await UserRepository.getUserByEmail(data.email!);
    if (existingEmail && existingEmail.verifiedUser)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `${data.email} is already registered`
      );
    if (existingEmail)
      await UserRepository.deleteUser(existingEmail._id as string); // deleting garbage requests
  }

  static async ensureCanGetOTP(UserRepository: IUserRepository, phone: string){
    const existingUser = await UserRepository.getUserByPhone(phone);
    if (!existingUser)
        throw new AppError(
        StatusCodes.BAD_REQUEST,
        `${phone} is not registered`
      );
    if(existingUser && existingUser.verifiedUser)
        throw new AppError(
        StatusCodes.BAD_REQUEST,
        `${phone} is already verified to a user`
      );
    
  }
}
