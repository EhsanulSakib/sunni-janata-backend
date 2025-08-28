import { DeleteResult } from "mongoose";
import { QueryBuilder } from "../../shared/utils/query_builder";
import {
  ILocation,
  ILocationDocument,
  ILocationModel,
} from "../db/locationModel";

export interface ILocationRepository {
  createLocation(location: ILocation): Promise<ILocationDocument>;
  getLocations(
    parentLocation: string | null,
    query: Record<string, unknown>
  ): Promise<ILocationDocument[]>;
  getLocationById(id: string): Promise<ILocationDocument | null>;
  getLocationByTitle(title: string): Promise<ILocationDocument | null>;
  updateLocation(
    id: string,
    location: Partial<ILocation>
  ): Promise<ILocationDocument | null>;
  deleteLocation(id: string): Promise<DeleteResult>;
}

export default class LocationRepository implements ILocationRepository {
  Model: ILocationModel;
  constructor(model: ILocationModel) {
    this.Model = model;
  }

  async createLocation(location: ILocation): Promise<ILocationDocument> {
    return await this.Model.create(location);
  }

  async getLocations(
    parentLocation: string | null,
    query: Record<string, unknown>
  ): Promise<ILocationDocument[]> {
    const qb = new QueryBuilder(this.Model, query);
    const res = qb.find({ parentLocation }).useLean();
    return await res.exec();
  }

  async getLocationById(id: string): Promise<ILocationDocument | null> {
    return await this.Model.findById(id).lean();
  }

  async updateLocation(
    id: string,
    location: Partial<ILocation>
  ): Promise<ILocationDocument | null> {
    return await this.Model.findByIdAndUpdate(id, location, {
      new: true,
    }).lean();
  }

  async deleteLocation(id: string): Promise<DeleteResult> {
    return await this.Model.deleteMany({
      $or: [{ _id: id }, { parentLocation: id }],
    });
  }

  async getLocationByTitle(title: string): Promise<ILocationDocument | null> {
    return await this.Model.findOne({ title }).lean();
  }
}
