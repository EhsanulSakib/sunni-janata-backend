import mongoose from "mongoose";
import { CommitteeType, DatabaseNames } from "../../shared/utils/enums";

export interface ICommittee {
  title: string;
  type: CommitteeType;
  location: mongoose.Schema.Types.ObjectId | string; // exp -> _id of division or any other down the ladder
  parentLocation?: mongoose.Schema.Types.ObjectId | string; // exp -> _id of division or any other down the ladder
  president: mongoose.Schema.Types.ObjectId | string; // _id of the president of the committee
  description?: string;
  address?: string;
}

export interface ICommitteeDocument extends ICommittee, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommitteeModel extends mongoose.Model<ICommitteeDocument> {}

const committeeSchema = new mongoose.Schema<ICommitteeDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: CommitteeType,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DatabaseNames.Location,
      required: true,
    },
    parentLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DatabaseNames.Location,
      default: null,
    },
    president: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DatabaseNames.User, // Assuming there's a User model for committee presidents
      required: true,
    },
    description: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const CommitteeModel = mongoose.model<ICommitteeDocument, ICommitteeModel>(
  DatabaseNames.Committee,
  committeeSchema,
  DatabaseNames.Committee
);

export default CommitteeModel;
