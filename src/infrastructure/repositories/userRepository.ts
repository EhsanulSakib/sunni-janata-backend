import { IPagination } from "../../shared/utils/query_builder";
import { IUser, IUserDocument } from "../db/userModel";

export interface UserRepository {
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
