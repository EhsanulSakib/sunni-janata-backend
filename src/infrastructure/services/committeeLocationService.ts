import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { ILocation } from "../db/locationModel";
import { ICommitteeRepository } from "../repositories/committeeRepository";
import { ILocationRepository } from "../repositories/locationRepository";
import { DeleteResult } from "mongoose";

export interface ICommitteeLocationService {
  createLocation(location: ILocation): Promise<ILocation>;
  getLocationsByParent(parentLocation: string | null): Promise<ILocation[]>;
  getLocationById(id: string): Promise<ILocation | null>;
  updateLocation(
    id: string,
    location: Partial<ILocation>
  ): Promise<ILocation | null>;
  deleteLocation(id: string): Promise<DeleteResult>;
}

export default class CommitteeLocationService {
  LocationRepository: ILocationRepository;
  CommitteeRepository: ICommitteeRepository;

  constructor(
    locationRepository: ILocationRepository,
    committeeRepository: ICommitteeRepository
  ) {
    this.LocationRepository = locationRepository;
    this.CommitteeRepository = committeeRepository;
  }

  async createLocation(location: ILocation): Promise<ILocation> {
    const existingLocation = await this.LocationRepository.getLocationByTitle(
      location.title
    );
    if (existingLocation)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Location with title ${location.title} already exists`
      );
    const newLcoation = await this.LocationRepository.createLocation(location);
    if (!newLcoation)
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to create location"
      );
    return newLcoation;
  }

  async getLocationsByParent(parentLocation: string): Promise<ILocation[]> {
    const locations = await this.LocationRepository.getLocations(
      parentLocation,
      {}
    );
    if (!locations) {
      throw new AppError(StatusCodes.NOT_FOUND, "Locations not found");
    }
    return locations;
  }

  async getLocationById(id: string): Promise<ILocation | null> {
    const location = await this.LocationRepository.getLocationById(id);
    if (!location) {
      throw new AppError(StatusCodes.NOT_FOUND, "Location not found");
    }
    return location;
  }

  async updateLocation(
    id: string,
    location: Partial<ILocation>
  ): Promise<ILocation | null> {
    const updatedLocation = await this.LocationRepository.updateLocation(
      id,
      location
    );
    if (!updatedLocation) {
      throw new AppError(StatusCodes.NOT_FOUND, "Location not found");
    }
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<DeleteResult> {
    const deleted = await this.LocationRepository.deleteLocation(id);
    if (!deleted)
      throw new AppError(StatusCodes.NOT_FOUND, "Location not found");
    return deleted;
  }
}
