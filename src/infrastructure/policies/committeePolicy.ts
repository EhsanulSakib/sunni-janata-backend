import { ICommitteeDocument } from "../db/committeeModel";
import { ICommitteeRepository } from "../repositories/committeeRepository";

export default class CommitteePolicy {
    static async ensureCommittee(committeeRepository: ICommitteeRepository, committeeId: string): Promise<ICommitteeDocument> {
        const committee = await committeeRepository.getCommitteeById(committeeId);
        if (!committee) {
            throw new Error("Committee not found");
        }
        return committee;
    }
}