import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { IAdmin, IAdminDocument, IAdminModel } from "../db/adminModel";

export interface IAdminRepository {
  findByUID(uid: number): Promise<IAdminDocument | null>;
  findByIdAndUpdate(
    id: string,
    data: Record<string, string>
  ): Promise<IAdminDocument>;
  create(data: IAdmin): Promise<IAdminDocument>;
  findById(id: string): Promise<IAdminDocument | null>;
}

export default class AdminRepository implements IAdminRepository {
  Model: IAdminModel;

  constructor(model: IAdminModel) {
    this.Model = model;
  }

  async findByUID(uid: number): Promise<IAdminDocument | null> {
    const adminData = await this.Model.findOne({ userId: uid });
    return adminData;
  }

  async findByIdAndUpdate(
    id: string,
    data: Record<string, string>
  ): Promise<IAdminDocument> {
    const adminData = await this.Model.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!adminData)
      throw new AppError(StatusCodes.NOT_FOUND, "Admin not found");
    return adminData;
  }

  async create(data: IAdmin): Promise<IAdminDocument> {
    const adminData = await this.Model.create(data);
    return adminData;
  }

  async findById(id: string): Promise<IAdminDocument | null> {
    const adminData = await this.Model.findById(id);
    if (!adminData)
      throw new AppError(StatusCodes.NOT_FOUND, "Admin not found");
    return adminData;
  }
  
}
