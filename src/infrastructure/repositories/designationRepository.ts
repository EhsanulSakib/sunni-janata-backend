import {
  IDesignation,
  IDesignationDocument,
  IDesignationModel,
} from "../db/designationModel";

export interface IDesignationRepository {
  createDesignation(data: IDesignation): Promise<IDesignationDocument>;
  updateDesgination(
    id: string,
    data: Partial<IDesignation>
  ): Promise<IDesignationDocument>;
  deleteDesignation(id: string): Promise<IDesignationDocument>;
  getDesignationById(id: string): Promise<IDesignationDocument | null>;
  getAllDesignations(): Promise<IDesignationDocument[]>;
  findByName(name: string): Promise<IDesignationDocument | null>;
}

export default class DesignationRepository implements IDesignationRepository {
  Model: IDesignationModel;

  constructor(model: IDesignationModel) {
    this.Model = model;
  }

  async createDesignation(data: IDesignation): Promise<IDesignationDocument> {
    const newDesignation = new this.Model(data);
    return await newDesignation.save();
  }

  async updateDesgination(
    id: string,
    data: Partial<IDesignation>
  ): Promise<IDesignationDocument> {
    const designation = await this.Model.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!designation) {
      throw new Error("Designation not found");
    }
    return designation;
  }

  async deleteDesignation(id: string): Promise<IDesignationDocument> {
    const designation = await this.Model.findByIdAndDelete(id);
    if (!designation) {
      throw new Error("Designation not found");
    }
    return designation;
  }

  async getDesignationById(id: string): Promise<IDesignationDocument | null> {
    return await this.Model.findById(id);
  }

  async getAllDesignations(): Promise<IDesignationDocument[]> {
    return await this.Model.find();
  }

  async findByName(name: string): Promise<IDesignationDocument | null> {
    return await this.Model.findOne({ title: name });
  }
}
