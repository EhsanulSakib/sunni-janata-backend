import mongoose, { Document, Schema } from "mongoose";
import { DatabaseNames } from "../../shared/utils/enums";

export interface IPresident {
  image: string | undefined;
  quote: string;
  name: string;
  details: string;
  designation: string;
}

export interface IPresidentDocument extends IPresident, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IPresidentModel extends mongoose.Model<IPresidentDocument> {}

const presidentSchema = new Schema<IPresidentDocument>(
  {
    image: { type: String, required: true },
    quote: { type: String, required: true },
    name: { type: String, required: true },
    details: { type: String, required: true },
    designation: { type: String, required: true },
  },
  { timestamps: true }
);

const PresidentModel = mongoose.model<IPresidentDocument, IPresidentModel>(
  DatabaseNames.President,
  presidentSchema,
  DatabaseNames.President
);

export default PresidentModel;
