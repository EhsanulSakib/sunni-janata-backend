import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { ILocation } from "../db/locationModel";
import { ICommitteeRepository } from "../repositories/committeeRepository";
import { ILocationRepository } from "../repositories/locationRepository";
import { DeleteResult } from "mongoose";
import { ICommittee, ICommitteeDocument } from "../db/committeeModel";
import { IPagination } from "../../shared/utils/query_builder";
import { LocationCommitteePolicty } from "../policies/locationCommitteePolicy";
import { IUserRepository } from "../repositories/userRepository";
import { UserPolicy } from "../policies/userPolicies";
import { IDesignationRepository } from "../repositories/designationRepository";

export interface ICommitteeLocationService {
  createLocation(location: ILocation): Promise<ILocation>;
  getLocationsByParent(parentLocation: string | null): Promise<ILocation[]>;
  getLocationById(id: string): Promise<ILocation | null>;
  updateLocation(
    id: string,
    location: Partial<ILocation>
  ): Promise<ILocation | null>;
  deleteLocation(id: string): Promise<DeleteResult>;
  createCommittee(committee: ICommittee): Promise<ICommitteeDocument>;
  getCommittees(query: Record<string, unknown>): Promise<{pagination: IPagination, committees: ICommitteeDocument[]}>;
  disbandCommittee(id: string): Promise<ICommitteeDocument>;
}

export default class CommitteeLocationService
  implements ICommitteeLocationService
{
  LocationRepository: ILocationRepository;
  CommitteeRepository: ICommitteeRepository;
  UserRepository: IUserRepository;
  DesignationRepository: IDesignationRepository;

  constructor(
    locationRepository: ILocationRepository,
    committeeRepository: ICommitteeRepository,
    userRepository: IUserRepository,
    designationRepository: IDesignationRepository,
  ) {
    this.LocationRepository = locationRepository;
    this.CommitteeRepository = committeeRepository;
    this.UserRepository = userRepository;
    this.DesignationRepository = designationRepository;
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

  async createCommittee(committee: ICommittee): Promise<ICommitteeDocument> {
    const user = await UserPolicy.ensureUserExistance(this.UserRepository, committee.president as string);
    const designation = await this.DesignationRepository.getDesignationById(user.assignedPosition as string);
    if (designation && designation.level == 1)
      throw new AppError(StatusCodes.BAD_REQUEST, `${user.fullName} is already a president`);
    const newCommittee = await this.CommitteeRepository.create(committee);
    const presidentId = await this.DesignationRepository.getPresidentId();
    await this.UserRepository.updateUser(user._id as string, {assignedCommittee: newCommittee._id as string, assignedPosition: presidentId});
    return newCommittee;
  }

  async getCommittees(query: Record<string, unknown>): Promise<{ pagination: IPagination; committees: ICommitteeDocument[]; }> {
    const committees = await this.CommitteeRepository.getCommittee(query);
    return committees;
  }

  async disbandCommittee(id: string): Promise<ICommitteeDocument> {
    await LocationCommitteePolicty.ensureCommittee(this.CommitteeRepository, id);
    // removing all the members associated with the community
    const removedPosition = await this.UserRepository.updateMany({assignedCommittee: id}, {assignedCommittee: null, assignedPosition: null});
    const deletedCommittee = await this.CommitteeRepository.delete(id);
    return deletedCommittee;
  }
}
