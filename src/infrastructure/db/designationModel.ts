import mongoose from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface IDesignation {
  title: string;
  level: number;
}

export interface IDesignationDocument extends IDesignation, mongoose.Document {}

export interface IDesignationModel
  extends mongoose.Model<IDesignationDocument> {}

const designationSchema = new mongoose.Schema<IDesignationDocument>({
  title: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
});

const DesignationModel = mongoose.model<
  IDesignationDocument,
  IDesignationModel
>(DatabaseNames.Designation, designationSchema, DatabaseNames.Designation);

export default DesignationModel;