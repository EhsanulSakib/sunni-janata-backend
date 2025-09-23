import { StatusCodes } from "http-status-codes";
import AppError from "../../shared/errors/app_errors";
import {
  ICommittee,
  ICommitteeDocument,
  ICommitteeModel
} from "../db/committeeModel";
import { IPagination, QueryBuilder } from "../../shared/utils/query_builder";
import mongoose, { Types } from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";
import UserModel from "../db/userModel";

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
    const existingCommittee = await this.Model.findOne({
      location: committee.location,
      type: committee.type
    });

    if (existingCommittee) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Committee already exists");
    }

    const isCentralCommittee = committee.type === "central";

    if (isCentralCommittee) {
      const centralCommittee = await this.Model.findOne({ type: "central" });
      if (centralCommittee) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Central Committee already exists"
        );
      }
    }

    const newCommittee = new this.Model(committee);
    return (await newCommittee.save()).populate("location president");
  }

  async delete(id: string): Promise<ICommitteeDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find committee
      const committee = await this.Model.findById(id).session(session);
      if (!committee) {
        throw new AppError(StatusCodes.NOT_FOUND, "Committee not found");
      }

      // 2. Concurrent tasks:
      //    a) Delete committee
      //    b) Update users who belong to this committee
      const [deletedCommittee] = await Promise.all([
        this.Model.findByIdAndDelete(id, { session }),
        UserModel.updateMany(
          { assignedCommittee: id },
          { $set: { assignedCommittee: null, assignedPosition: null } },
          { session }
        )
      ]);

      if (!deletedCommittee) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Failed to delete committee"
        );
      }

      // 3. Commit transaction
      await session.commitTransaction();
      return deletedCommittee;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getCommitteeById(id: string): Promise<ICommitteeDocument | null> {
    return await this.Model.findById(id);
  }

  async update(
    id: string,
    committee: Partial<ICommittee>
  ): Promise<ICommitteeDocument> {
    const updated = await this.Model.findByIdAndUpdate(id, committee, {
      new: true
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
    const pipeline = [];

    // Build match stage for filtering
    let match: any = {};
    if (query.location && typeof query.location === "string") {
      match.location = new Types.ObjectId(query.location);
    }
    if (
      query.title &&
      typeof query.title === "string" &&
      query.title.trim() !== ""
    ) {
      match.title = { $regex: new RegExp(query.title.trim(), "i") };
    }
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    console.log("Committee aggregation match:", match);

    // Lookup for president
    pipeline.push({
      $lookup: {
        from: DatabaseNames.User,
        localField: "president",
        foreignField: "_id",
        as: "presidentDetails"
      }
    });

    // Lookup for location
    pipeline.push({
      $lookup: {
        from: DatabaseNames.Location,
        localField: "location",
        foreignField: "_id",
        as: "locationDetails"
      }
    });

    // Lookup for parentLocation
    pipeline.push({
      $lookup: {
        from: DatabaseNames.Location,
        localField: "parentLocation",
        foreignField: "_id",
        as: "parentLocationDetails"
      }
    });

    // Unwind president, location, and parentLocation
    pipeline.push({
      $unwind: {
        path: "$presidentDetails",
        preserveNullAndEmptyArrays: true
      }
    });
    pipeline.push({
      $unwind: {
        path: "$locationDetails",
        preserveNullAndEmptyArrays: true
      }
    });
    pipeline.push({
      $unwind: {
        path: "$parentLocationDetails",
        preserveNullAndEmptyArrays: true
      }
    });

    // Project fields
    pipeline.push({
      $project: {
        title: 1,
        type: 1,
        description: 1,
        address: 1,
        location: 1,
        parentLocation: 1,
        president: 1,
        "presidentDetails.fullName": 1,
        "presidentDetails.avatar": 1,
        "presidentDetails.email": 1,
        "locationDetails.title": 1,
        "parentLocationDetails.title": 1,
        createdAt: 1,
        updatedAt: 1
      }
    });

    // Apply sorting and pagination using QueryBuilder
    const qb = new QueryBuilder(this.Model, query);
    const res = qb.aggregate(pipeline).sort().paginate();
    const committees = await res.exec();
    const pagination = await res.countTotal();

    return { committees, pagination };
  }

  async getCommitteeDetails(id: string): Promise<ICommitteeDocument> {
    const pipeline = [];
    const match = {
      $match: {
        _id: new Types.ObjectId(id)
      }
    };

    const addPresidentLookup = {
      $lookup: {
        from: DatabaseNames.User,
        localField: "president",
        foreignField: "_id",
        as: "President"
      }
    };
    const addLocationLookup = {
      $lookup: {
        from: DatabaseNames.Location,
        localField: "location",
        foreignField: "_id",
        as: "location"
      }
    };
    const addMembersLookup = {
      $lookup: {
        from: DatabaseNames.User,
        let: { committeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$assignedCommittee", "$$committeeId"] }
            }
          },
          {
            $lookup: {
              from: DatabaseNames.Designation, // Assuming this is your position collection name
              localField: "assignedPosition",
              foreignField: "_id",
              as: "position"
            }
          },
          {
            $unwind: {
              path: "$position",
              preserveNullAndEmptyArrays: true
            }
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
                  phone: "$phone"
                }
              }
            }
          },
          {
            $group: {
              _id: null,
              members: {
                $push: {
                  k: "$_id",
                  v: "$users"
                }
              }
            }
          },
          {
            $replaceRoot: {
              newRoot: { $arrayToObject: "$members" }
            }
          }
        ],
        as: "membersByPosition"
      }
    };

    const unwind = [
      {
        $unwind: {
          path: "$President",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$location",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$membersByPosition",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    const project = {
      $project: {
        title: 1,
        type: 1,
        description: 1,
        address: 1,
        "location.title": 1,
        "President.fullName": 1,
        "President.avatar": 1
      }
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
}
