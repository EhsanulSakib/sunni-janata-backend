import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { IPagination, QueryBuilder } from "../../shared/utils/query_builder";
import { IUser, IUserDocument, IUserModel } from "../db/userModel";

export interface IUserRepository {
  createUser(data: IUser): Promise<IUserDocument>;
  getUserByEmail(email: string): Promise<IUserDocument | null>;
  getUserByPhone(phone: string): Promise<IUserDocument | null>;
  getUserById(id: string): Promise<IUserDocument | null>;
  updateUser(id: string, data: Partial<IUser>): Promise<IUserDocument>;
  deleteUser(id: string): Promise<IUserDocument>;
  getAllUsers(
    query: Record<string, unknown>
  ): Promise<{ users: IUserDocument[]; pagination: IPagination }>;
}

export default class UserRepository implements IUserRepository {
  Model: IUserModel;
  constructor(model: IUserModel) {
    this.Model = model;
  }

  async createUser(data: IUser): Promise<IUserDocument> {
    const user = new this.Model(data);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await this.Model.findOne({ email });
  }

  async getUserByPhone(phone: string): Promise<IUserDocument | null> {
    return await this.Model.findOne({ phone });
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return await this.Model.findById(id);
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUserDocument> {
    const updated = await this.Model.findByIdAndUpdate(id, data, { new: true });
    if (!updated)
      throw new AppError(StatusCodes.NOT_FOUND, `User with id ${id} not found`);
    return updated;
  }

  async deleteUser(id: string): Promise<IUserDocument> {
    const deleted = await this.Model.findByIdAndDelete(id);
    if (!deleted)
      throw new AppError(StatusCodes.NOT_FOUND, `User with id ${id} not found`);
    return deleted;
  }

  async getAllUsers(
    query: Record<string, unknown>
  ): Promise<{ users: IUserDocument[]; pagination: IPagination }> {
    const qb = new QueryBuilder(this.Model, query);
    const rse = qb.sort().paginate();
    const users = await rse.exec();
    const pagination = await rse.countTotal();
    return { users, pagination };
  }
}
