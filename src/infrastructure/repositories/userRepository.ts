import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { IPagination, QueryBuilder } from "../../shared/utils/query_builder";
import { IUser, IUserDocument, IUserModel } from "../db/userModel";
import { PipelineStage, UpdateResult, ClientSession } from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface IUserRepository {
  createUser(data: IUser): Promise<IUserDocument>;
  getUserByEmail(email: string): Promise<IUserDocument | null>;
  getUserByPhone(phone: string): Promise<IUserDocument | null>;
  getUserById(id: string, session?: ClientSession): Promise<IUserDocument | null>;
  findOneByCommitteeAndPosition({
    assignedCommittee,
    assignedPosition
  }: {
    assignedCommittee: string;
    assignedPosition: string;
  }): Promise<IUserDocument | null>;
  updateUser(id: string, data: Partial<IUser>, options?: { session: ClientSession }): Promise<IUserDocument>;
  deleteUser(id: string): Promise<IUserDocument>;
  getAllUsers(
    query: Record<string, unknown>
  ): Promise<{ users: IUserDocument[]; pagination: IPagination }>;
  getUsersByStatus(
    status: string,
    query: Record<string, unknown>
  ): Promise<{ pagination: IPagination; users: IUserDocument[] }>;
  updateMany(
    filter: Partial<IUser>,
    data: Partial<IUser>
  ): Promise<UpdateResult>;
  aggregate(pipeline: PipelineStage[]): Promise<IUserDocument[]>;
  startSession(): Promise<ClientSession>;
}

export default class UserRepository implements IUserRepository {
  Model: IUserModel;
  constructor(model: IUserModel) {
    this.Model = model;
  }

  async startSession(): Promise<ClientSession> {
    return await this.Model.db.startSession();
  }

  async createUser(data: IUser): Promise<IUserDocument> {
    const user = new this.Model(data);
    return await user.save();
  }

  async aggregate(pipeline: PipelineStage[]) {
    return this.Model.aggregate(pipeline);
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return await this.Model.findOne({ email }).session(null);
  }

  async findOneByCommitteeAndPosition({
    assignedCommittee,
    assignedPosition
  }: {
    assignedCommittee: string;
    assignedPosition: string;
  }): Promise<IUserDocument | null> {
    return await this.Model.findOne({
      assignedCommittee,
      assignedPosition
    }).session(null);
  }

  async getUserByPhone(phone: string): Promise<IUserDocument | null> {
    return await this.Model.findOne({ phone }).session(null);
  }

  async getUserById(id: string, session?: ClientSession): Promise<IUserDocument | null> {
    return await this.Model.findById(id).session(session || null);
  }

  async updateUser(id: string, data: Partial<IUser>, options?: { session: ClientSession }): Promise<IUserDocument> {
    const updated = await this.Model.findByIdAndUpdate(id, data, { new: true, session: options?.session })
      .select("-password -otp")
      .populate("assignedCommittee", "title")
      .populate("assignedPosition", "title");
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

  async getUsersByStatus(
    status: string,
    query: Record<string, unknown>
  ): Promise<{ pagination: IPagination; users: IUserDocument[] }> {
    // 🔹 Build initial pipeline
    const pipeline = [];

    if (status === "not-assigned") {
      pipeline.push({
        $match: {
          accountStatus: "approved",
          assignedCommittee: { $exists: true, $eq: null },
          assignedPosition: { $exists: true, $eq: null }
        }
      });
    } else {
      pipeline.push({
        $match: { accountStatus: status }
      });
    }

    // Lookups
    pipeline.push(
      {
        $lookup: {
          from: DatabaseNames.Committee,
          localField: "assignedCommittee",
          foreignField: "_id",
          as: "assignedCommittee"
        }
      },
      {
        $lookup: {
          from: DatabaseNames.Designation,
          localField: "assignedPosition",
          foreignField: "_id",
          as: "assignedPosition"
        }
      },
      {
        $unwind: {
          path: "$assignedCommittee",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$assignedPosition",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          avatar: 1,
          requestedPosition: 1,
          role: 1,
          dob: 1,
          accountStatus: 1,
          assignedPosition: { title: 1, level: 1 },
          assignedCommittee: { title: 1, type: 1, address: 1 },
          createdAt: 1,
          updatedAt: 1
        }
      }
    );

    // Use QueryBuilder in aggregate mode
    const qb = new QueryBuilder<IUserDocument>(this.Model, query)
      .aggregate(pipeline)
      .sort()
      .paginate();

    // Execute query
    const users = await qb.exec();

    // Get pagination info
    const pagination = await qb.countTotal();

    return { users, pagination };
  }

  async updateMany(
    filter: Partial<IUser>,
    data: Partial<IUser>
  ): Promise<UpdateResult> {
    return await this.Model.updateMany(filter, data);
  }
}