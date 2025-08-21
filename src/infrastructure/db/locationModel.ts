import mongoose from "mongoose";
import { DatabaseNames, LocationLevels } from "../../shared/utils/enums";

export interface ILocation {
  title: string;
  level: LocationLevels;
  parentLevel: mongoose.Schema.Types.ObjectId | null;
}

export interface ILocationDocument extends ILocation, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocationModel extends mongoose.Model<ILocationDocument> {}

const locationSchema = new mongoose.Schema<ILocationDocument>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    level: {
      type: String,
      enum: LocationLevels,
      required: true,
    },
    parentLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DatabaseNames.Location,
      default: null,
    },
  },
  { timestamps: true }
);

const Location = mongoose.model<ILocationDocument, ILocationModel>(
  DatabaseNames.Location,
  locationSchema,
  DatabaseNames.Location
);

export default Location;
