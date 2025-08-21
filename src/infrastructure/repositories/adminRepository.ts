import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { IAdminDocument, IAdminModel } from "../db/adminModel";

export interface IAdminRepository {
  findByUID(uid: string): Promise<IAdminDocument>;
  findByIdAndUpdate(
    id: string,
    data: Record<string, string>
  ): Promise<IAdminDocument>;
}

export default class AdminRepository implements IAdminRepository {
  Model: IAdminModel;

  constructor(model: IAdminModel) {
    this.Model = model;
  }

  async findByUID(uid: string): Promise<IAdminDocument> {
    const adminData = await this.Model.findOne({ uid });
    if (!adminData)
      throw new AppError(StatusCodes.NOT_FOUND, "Admin not found");
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
}
