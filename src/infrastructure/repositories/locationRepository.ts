import { QueryBuilder } from "../../shared/utils/query_builder";
import { ILocation, ILocationDocument, ILocationModel } from "../db/locationModel";

export interface ILocationRepository {
    createLocation(location: ILocation): Promise<ILocationDocument>;
    getLocations(parentLevel: string | null, query: Record<string, unknown>): Promise<ILocationDocument[]>;
    getLocationById(id: string): Promise<ILocationDocument | null>;
    updateLocation(id: string, location: ILocation): Promise<ILocationDocument | null>;
    deleteLocation(id: string): Promise<ILocationDocument | null>;
}

export default class LocationRepository implements ILocationRepository {
    Model: ILocationModel;
    constructor(model: ILocationModel) {
        this.Model = model;
    }

    async createLocation(location: ILocation): Promise<ILocationDocument> {
        return await this.Model.create(location);
    }

    async getLocations(parentLevel: string | null, query: Record<string, unknown>): Promise<ILocationDocument[]> {
        const qb = new QueryBuilder(this.Model, query);
        const res = qb.find({parentLevel}).useLean();
        return await res.exec();
    }

    async getLocationById(id: string): Promise<ILocationDocument | null> {
        return await this.Model.findById(id).lean();
    }

    async updateLocation(id: string, location: ILocation): Promise<ILocationDocument | null> {
        return await this.Model.findByIdAndUpdate(id, location, { new: true }).lean();
    }

    async deleteLocation(id: string): Promise<ILocationDocument | null> {
        return await this.Model.findByIdAndDelete(id).lean();
    }
}