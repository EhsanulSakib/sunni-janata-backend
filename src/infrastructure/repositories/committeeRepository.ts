import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import {
  ICommittee,
  ICommitteeDocument,
  ICommitteeModel,
} from "../db/committeeModel";
import { IPagination, QueryBuilder } from "../../shared/utils/query_builder";
import { Types } from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface ICommitteeRepository {
  create(committee: ICommittee): Promise<ICommitteeDocument>;
  getCommittee(
    query: Record<string, unknown>
  ): Promise<{ pagination: IPagination; committees: ICommitteeDocument[] }>;
  getCommitteeById(id: string): Promise<ICommitteeDocument | null>;
  getCommitteeDetails(id: string): Promise<ICommitteeDocument>;
  //   getById(id: string): Promise<ICommitteeDocument>;)
  update(
    id: string,
    committee: Partial<ICommittee>
  ): Promise<ICommitteeDocument>;
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
    const deletedCommittee = await this.Model.findByIdAndDelete(id);
    if (!deletedCommittee) {
      throw new AppError(StatusCodes.NOT_FOUND, "Committee not found");
    }
    return deletedCommittee;
  }

  async getCommitteeById(id: string): Promise<ICommitteeDocument | null> {
    return await this.Model.findById(id);
  }

  async update(
    id: string,
    committee: Partial<ICommittee>
  ): Promise<ICommitteeDocument> {
    const updated = await this.Model.findByIdAndUpdate(id, committee, {
      new: true,
    })
      .populate("location", "title")
      .populate("president", "fullName avatar email");
    if (!updated)
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `Committee with id ${id} not found`
      );
    return updated;
  }

  async getCommittee(
    query: Record<string, unknown>
  ): Promise<{ pagination: IPagination; committees: ICommitteeDocument[] }> {
    let filter: { parentLocation?: string | null; location?: string } = {};
    if ("parentLocation" in query) {
      filter.parentLocation =
        (query.parentLocation as string) == ""
          ? null
          : (query.parentLocation as string);
    }
    if ("location" in query && query.location != undefined) {
      filter.location = query.location as string;
    }
    console.log(filter);

    const qb = new QueryBuilder(this.Model, query);
    const res = qb.find(filter).sort().paginate();
    const committees = await res.exec();
    const pagination = await res.countTotal();
    return { committees, pagination };
  }

  async getCommitteeDetails(id: string): Promise<ICommitteeDocument> {
    const pipeline = [];
    const match = {
      $match: {
        _id: new Types.ObjectId(id),
      },
    };

    const addPresidentLookup = {
      $lookup: {
        from: DatabaseNames.User,
        localField: "president",
        foreignField: "_id",
        as: "President",
      },
    };
    const addLocationLookup = {
      $lookup: {
        from: DatabaseNames.Location,
        localField: "location",
        foreignField: "_id",
        as: "location",
      },
    };
    const addMembersLookup = {
      $lookup: {
        from: DatabaseNames.User,
        let: { committeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$assignedCommittee", "$$committeeId"] },
            },
          },
          {
            $lookup: {
              from: DatabaseNames.Designation, // Assuming this is your position collection name
              localField: "assignedPosition",
              foreignField: "_id",
              as: "position",
            },
          },
          {
            $unwind: {
              path: "$position",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$position.title",
              users: {
                $push: {
                  _id: "$_id",
                  fullName: "$fullName",
                  avatar: "$avatar",
                  email: "$email", // Add other fields you need
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              members: {
                $push: {
                  k: "$_id",
                  v: "$users",
                },
              },
            },
          },
          {
            $replaceRoot: {
              newRoot: { $arrayToObject: "$members" },
            },
          },
        ],
        as: "membersByPosition",
      },
    };

    const unwind = [
      {
        $unwind: {
          path: "$President",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$location",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$membersByPosition",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const project = {
      $project: {
        title: 1,
        type: 1,
        description: 1,
        address: 1,
        "location.title": 1,
        "President.fullName": 1,
        "President.avatar": 1,
      },
    };

    pipeline.push(match);
    pipeline.push(addPresidentLookup);
    pipeline.push(addLocationLookup);
    pipeline.push(...unwind);
    pipeline.push(project);
    pipeline.push(addMembersLookup);

    const details = await this.Model.aggregate(pipeline);
    return details[0];
  }


  // async getCommittee(parentLocation: string | null): Promise<ICommitteeDocument[]> {

  // }

  // async update(id: string, committee: Partial<ICommittee>): Promise<ICommitteeDocument> {

  // }

  // async getById(id: string): Promise<ICommitteeDocument> {

  // }
}
