import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import { ICommittee, ICommitteeDocument, ICommitteeModel } from "../db/committeeModel";
import { IPagination, QueryBuilder } from "../../shared/utils/query_builder";

export interface ICommitteeRepository {
  create(committee: ICommittee): Promise<ICommitteeDocument>;
  getCommittee(query: Record<string, unknown>): Promise<{pagination: IPagination, committees: ICommitteeDocument[]}>;
//   getCommittee(parentLocation: string | null): Promise<ICommitteeDocument[]>;
  getCommitteeById(id: string): Promise<ICommitteeDocument | null>;
//   update(id: string, committee: Partial<ICommittee>): Promise<ICommitteeDocument>;
  delete(id: string): Promise<ICommitteeDocument>; // must delete the committee as well from the users
}

export default class CommitteeRepository implements ICommitteeRepository {
    Model: ICommitteeModel;

    constructor(model: ICommitteeModel) {
        this.Model = model;
    }

    async create(committee: ICommittee): Promise<ICommitteeDocument> {
        const newCommittee = new this.Model(committee);
        return (await newCommittee.save()).populate("location president");
    }

    async delete(id: string): Promise<ICommitteeDocument> {
        throw new AppError(StatusCodes.NOT_IMPLEMENTED, "Method not implemented.");
        // const deletedCommittee = await this.Model.findByIdAndDelete(id);
        // if (!deletedCommittee) {
        //     throw new AppError(StatusCodes.NOT_FOUND, "Committee not found");
        // }
        // return deletedCommittee;
    }

    async getCommitteeById(id: string): Promise<ICommitteeDocument | null> {
        return await this.Model.findById(id);
    }

    async getCommittee(query: Record<string, unknown>): Promise<{ pagination: IPagination; committees: ICommitteeDocument[]; }> {
        let filter:{parentLocation?: string | null, location?: string} = {};
        if('parentLocation' in query){
            filter.parentLocation = query.parentLocation as string == ''? null : query.parentLocation as string;
        }
        if('location' in query && query.location != undefined){
            filter.location = query.location as string;
        }
        console.log(filter);
        
        const qb = new QueryBuilder(this.Model, query);
        const res = qb.find(filter).sort().paginate();
        const committees = await res.exec();
        const pagination = await res.countTotal();
        return { committees, pagination };
    }
    
    // async getCommittee(parentLocation: string | null): Promise<ICommitteeDocument[]> {
        
    // }

    // async update(id: string, committee: Partial<ICommittee>): Promise<ICommitteeDocument> {
        
    // }

    // async getById(id: string): Promise<ICommitteeDocument> {
        
    // }



}
