import { uploadFileToCloudinary } from "../../shared/utils/cloudinary_file_operations";
import { CloudinaryFolders } from "../../shared/utils/enums";
import { IConstitution, IConstitutionDocument } from "../db/constitutionModel";
import { IConstitutionRepository } from "../repositories/constitutionRepository";
import AppError from "../../shared/errors/app_errors";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export interface IConstitutionService {
  getConstitution(): Promise<IConstitution | null>;
  updateConstitution(file: Express.Multer.File): Promise<IConstitution>;
}

export class ConstitutionService implements IConstitutionService {
  ConstitutionRepository: IConstitutionRepository;

  constructor(constitutionRepository: IConstitutionRepository) {
    this.ConstitutionRepository = constitutionRepository;
  }

  async getConstitution(): Promise<IConstitution | null> {
    return await this.ConstitutionRepository.getConstitution();
  }

  async updateConstitution(file: Express.Multer.File): Promise<IConstitution> {
    if (!file) {
      throw new AppError(StatusCodes.BAD_REQUEST, "No PDF file provided");
    }

    let newUrl: string;
    const newPublicId = "sunni-janata-party-constitution"; // Custom publicId

    // Upload new PDF with resource_type: "raw" and custom publicId
    try {
      newUrl = await uploadFileToCloudinary({
        file,
        folder: CloudinaryFolders.Constitution,
        isVideo: false,
        resource_type: "raw",
        publicId: newPublicId, // Specify custom publicId
      });
      if (!newUrl) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "PDF upload failed");
      }
    } catch (error: any) {
      throw new AppError(
        error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || "PDF upload failed"
      );
    }

    try {
      const constitutionData: IConstitution = {
        url: newUrl,
        publicId: newPublicId,
      };

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let updatedDoc: IConstitutionDocument;
        const existing: IConstitutionDocument | null = await this.ConstitutionRepository.getConstitution();
        if (existing && existing._id) {
          updatedDoc = await this.ConstitutionRepository.updateConstitution(
            existing._id.toString(),
            constitutionData,
            { session }
          );
        } else {
          updatedDoc = await this.ConstitutionRepository.create(
            constitutionData,
            { session }
          );
        }

        await session.commitTransaction();
        return updatedDoc;
      } catch (error: any) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error: any) {
      // Skip deleting new file on failure, as deleteFileFromCloudinary doesn't support "raw"
      throw new AppError(
        error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || "Constitution update failed"
      );
    }
  }
}