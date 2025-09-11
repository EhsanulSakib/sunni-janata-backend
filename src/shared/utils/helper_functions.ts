import crypto from "crypto";
import AppError from "../errors/app_errors";
import { StatusCodes } from "http-status-codes";

export const generateFileHash = (buffer: Buffer): string => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

export function isVideoFile(filename: string): boolean {
  const videoExtensions = [
    ".mp4",
    ".mov",
    ".avi",
    ".wmv",
    ".flv",
    ".mkv",
    ".webm",
    ".mpeg",
    ".mp3",
    ".wav",
    ".ogg",
    ".aac",
    ".flac",
  ];
  const ext = filename.toLowerCase().split(".").pop();
  return ext ? videoExtensions.includes(`.${ext}`) : false;
}

export function checkFieldsExistence(fields: Record<string, any>) {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `${fieldName} is required`
      );
    }
  }
}

export function otpStatusCodeToMessage(code: number): string {
  switch (code) {
    case 202:
      return "SMS Submitted Successfully";
    case 1001:
      return "Invalid Number";
    case 1002:
      return "Sender ID not correct / Sender ID is disabled";
    case 1003:
      return "Please provide all required fields / Contact your System Administrator";
    case 1005:
      return "Internal Error";
    case 1006:
      return "Balance Validity Not Available";
    case 1007:
      return "Balance Insufficient";
    case 1011:
      return "User ID not found";
    case 1012:
      return "Masking SMS must be sent in Bengali";
    case 1013:
      return "Sender ID has not found Gateway by API key";
    case 1014:
      return "Sender Type Name not found using this sender by API key";
    case 1015:
      return "Sender ID has not found Any Valid Gateway by API key";
    case 1016:
      return "Sender Type Name Active Price Info not found by this sender ID";
    case 1017:
      return "Sender Type Name Price Info not found by this sender ID";
    case 1018:
      return "The Owner of this (username) Account is disabled";
    case 1019:
      return "The (sender type name) Price of this (username) Account is disabled";
    case 1020:
      return "The parent of this account is not found";
    case 1021:
      return "The parent active (sender type name) price of this account is not found";
    case 1031:
      return "Your Account Not Verified, Please Contact Administrator";
    case 1032:
      return "IP Not whitelisted";
    default:
      return "Unknown Status Code";
  }
}
