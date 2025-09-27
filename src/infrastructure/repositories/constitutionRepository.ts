import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import {
  IConstitution,
  IConstitutionDocument,
  IConstitutionModel,
} from "../db/constitutionModel";
import { ClientSession } from "mongoose";

export interface IConstitutionRepository {
  getConstitution(): Promise<IConstitutionDocument | null>; // Changed to IConstitutionDocument
  updateConstitution(
    id: string,
    constitution: IConstitution,
    options?: { session: ClientSession }
  ): Promise<IConstitutionDocument>;
  create(
    constitution: IConstitution,
    options?: { session: ClientSession }
  ): Promise<IConstitutionDocument>;
}

export default class ConstitutionRepository implements IConstitutionRepository {
  Model: IConstitutionModel;

  constructor(model: IConstitutionModel) {
    this.Model = model;
  }

  async getConstitution(): Promise<IConstitutionDocument | null> {
    const constitution = await this.Model.findOne().sort({ createdAt: -1 });
    return constitution || null;
  }

  async create(
    constitution: IConstitution,
    options?: { session: ClientSession }
  ): Promise<IConstitutionDocument> {
    const [newConstitution] = await this.Model.create([constitution], options);
    return newConstitution;
  }

  async updateConstitution(
    id: string,
    constitution: IConstitution,
    options?: { session: ClientSession }
  ): Promise<IConstitutionDocument> {
    const updatedConstitution = await this.Model.findByIdAndUpdate(
      id,
      constitution,
      {
        new: true,
        runValidators: true,
        ...options,
      }
    );

    if (!updatedConstitution) {
      throw new AppError(StatusCodes.NOT_FOUND, "Constitution not found");
    }

    return updatedConstitution;
  }
}