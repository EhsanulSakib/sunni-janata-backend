import { StatusCodes } from "http-status-codes";
import cloudinary from "../configs/cloudinaryConfig";
import AppError from "../errors/app_errors";
import { generateFileHash } from "./helper_functions";

export const uploadFileToCloudinary = ({
  isVideo,
  folder,
  file,
  resource_type,
  publicId, // Added to allow custom publicId
}: {
  isVideo: boolean;
  folder: string;
  file: Express.Multer.File;
  resource_type?: "image" | "video" | "raw" | "auto" | undefined;
  publicId?: string; // Optional custom publicId
}) => {
  const defaultPublicId = generateFileHash(file.buffer);
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId || defaultPublicId, // Use custom publicId if provided
        folder: folder,
        resource_type: resource_type || (isVideo ? "video" : "image"),
        overwrite: true, // Overwrite to avoid multiple versions
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

export const deleteFileFromCloudinary = async ({
  publicId,
  isVideo,
}: {
  publicId: string;
  isVideo: boolean;
}): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: isVideo ? "video" : "image",
    });

    if (result.result == "not found")
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "File not found");
    if (result.result != "ok")
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "File deletion failed"
      );
    return result.result === "ok";
  } catch (error: any) {
    throw new AppError(
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || "File Deletion failed"
    );
  }
};