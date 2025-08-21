import { UpdateResult } from "mongoose";
import { IPagination, QueryBuilder } from "../../shared/utils/query_builder";
import {
  IContactMessage,
  IContactMessageDocument,
  IContactMessageModel,
} from "../db/contactMessageModel";
import AppError from "../../shared/errors/app_errors";
import { StatusCodes } from "http-status-codes";

export interface IContactMessageRepository {
  create(data: IContactMessage): Promise<IContactMessageDocument>;
  getAll(
    query: Record<string, unknown>
  ): Promise<{ pagination: IPagination; data: IContactMessageDocument[], unseen: number }>;
  getById(id: string): Promise<IContactMessageDocument>;
  delete(id: string): Promise<IContactMessageDocument>;
  markRead(): Promise<UpdateResult>;
}

export default class ContactMessageRepository
  implements IContactMessageRepository
{
  Model: IContactMessageModel;

  constructor(model: IContactMessageModel) {
    this.Model = model;
  }

  async create(data: IContactMessage): Promise<IContactMessageDocument> {
    const message = new this.Model(data);
    return await message.save();
  }

  async getAll(
    query: Record<string, unknown>
  ): Promise<{ pagination: IPagination; data: IContactMessageDocument[], unseen: number }> {
    const qb = new QueryBuilder(this.Model, query);
    const res = qb.sort().selectField("name email createdAt").paginate();
    const data = await res.exec();
    const pagination = await res.countTotal();
    const unseen = await this.Model.countDocuments({ seen: false });
    return { pagination, data, unseen };
  }

  async getById(id: string): Promise<IContactMessageDocument> {
     const message = await this.Model.findById(id);
    if (!message) {
      throw new AppError(StatusCodes.NOT_FOUND, "Message not found");
    }
    return message;
  }

  async delete(id: string): Promise<IContactMessageDocument> {
    const message = await this.Model.findByIdAndDelete(id);
    if (!message) {
      throw new AppError(StatusCodes.NOT_FOUND, "Message not found");
    }
    return message;
  }

  async markRead(): Promise<UpdateResult> {
    return await this.Model.updateMany(
      { seen: false },
      { $set: { seen: true } }
    );
  }
}
