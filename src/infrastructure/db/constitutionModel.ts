import mongoose, { Document, Schema } from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface IConstitution {
  url: string;
  publicId: string | undefined; // Store publicId for future deletion if possible
}

export interface IConstitutionDocument extends IConstitution, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IConstitutionModel extends mongoose.Model<IConstitutionDocument> {}

const constitutionSchema = new Schema<IConstitutionDocument>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: false },
  },
  { timestamps: true }
);

const ConstitutionModel = mongoose.model<IConstitutionDocument, IConstitutionModel>(
  DatabaseNames.Constitution,
  constitutionSchema,
  DatabaseNames.Constitution
);

export default ConstitutionModel;