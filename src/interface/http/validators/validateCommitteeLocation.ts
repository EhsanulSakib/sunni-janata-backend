import { StatusCodes } from "http-status-codes";
import AppError from "../../../shared/errors/app_errors";
import { CommitteeType, LocationLevels } from "../../../shared/utils/enums";

export function validateCreateLocation(body: Record<string, any>) {
  const { title, level, parentLocation } = body;
  if (!title) throw new AppError(StatusCodes.BAD_REQUEST, "title is required");
  if (!level) throw new AppError(StatusCodes.BAD_REQUEST, "level is required");
  if (!Object.values(LocationLevels).includes(level))
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `type ${level} is not valid Type`
    );
}


export function validateEditLocation(body: Record<string, any>) {
  const { title, level } = body;
  if(!title && !level) throw new AppError(StatusCodes.BAD_REQUEST, "Nothing to update");
  if (level && !Object.values(LocationLevels).includes(level))
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `type ${level} is not valid Type`
    );
}

export function validateCreateCommittee(body: Record<string, any>) {
  const {title, type, location, parentLocation, president, description, address} = body;
  if(!title || !type || !location  || !president) throw new AppError(StatusCodes.BAD_REQUEST, "All fields are required");
  if(!Object.values(CommitteeType).includes(type)) throw new AppError(StatusCodes.BAD_REQUEST, `type ${type} is not valid Type`);
}

