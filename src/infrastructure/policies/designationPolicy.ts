import { IDesignationDocument } from "../db/designationModel";
import { IDesignationRepository } from "../repositories/designationRepository";

export default class DesignationPolicy {
    static async ensureDesignnation(designationRepository: IDesignationRepository, designationId: string): Promise<IDesignationDocument> {
        const designation = await designationRepository.getDesignationById(designationId);
        if (!designation) {
            throw new Error("Designation not found");
        }
        return designation;
    }
}