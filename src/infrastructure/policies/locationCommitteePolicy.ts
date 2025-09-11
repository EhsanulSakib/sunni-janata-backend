import { ICommitteeDocument } from "../db/committeeModel";
import { ILocationDocument } from "../db/locationModel";
import { ICommitteeRepository } from "../repositories/committeeRepository";
import { ILocationRepository } from "../repositories/locationRepository";

export class LocationCommitteePolicty {
    static async ensureLocation(locationRepository: ILocationRepository, locationId: string):Promise<ILocationDocument> {
        const location = await locationRepository.getLocationById(locationId);
        if (!location) {
            throw new Error("Location not found");
        }
        return location;
    }

    static async ensureCommittee(committeeRepository: ICommitteeRepository, committeeId: string):Promise<ICommitteeDocument> {
        const committee = await committeeRepository.getCommitteeById(committeeId);
        if (!committee) {
            throw new Error("Committee not found");
        }
        return committee;
    }

}