import { Request, Response } from "express";
import { ICommitteeLocationService } from "../../../infrastructure/services/committeeLocationService";
import catchAsync from "../../../shared/utils/catch_async";
import {
  validateCreateCommittee,
  validateCreateLocation,
  validateEditLocation,
} from "../validators/validateCommitteeLocation";
import sendResponse from "../../../shared/utils/send_response";

export default class CommitteeLocationController {
  Service: ICommitteeLocationService;

  constructor(service: ICommitteeLocationService) {
    this.Service = service;
  }

  createLocation = catchAsync(async (req: Request, res: Response) => {
    validateCreateLocation(req.body);
    const { title, level, parentLocation } = req.body;
    const result = await this.Service.createLocation({
      level,
      parentLocation,
      title,
    });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Location created successfully",
      result: result,
    });
  });

  getLocationsByParent = catchAsync(async (req: Request, res: Response) => {
    let parentId: string | null | undefined = req.params.parentId as
      | string
      | null;

    if (parentId === "none") {
      parentId = null;
    }
    const result = await this.Service.getLocationsByParent(parentId);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Locations fetched successfully",
      result: result,
    });
  });

  getLocationDetails = catchAsync(async (req: Request, res: Response) => {
    const { locationId } = req.params;
    const result = await this.Service.getLocationById(locationId);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Location fetched successfully",
      result: result,
    });
  });

  updateLocation = catchAsync(async (req: Request, res: Response) => {
    const { locationId } = req.params;
    validateEditLocation(req.body);
    const { title, level } = req.body;
    const result = await this.Service.updateLocation(locationId, {
      level,
      title,
    });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Location updated successfully",
      result: result,
    });
  });

  deleteLocation = catchAsync(async (req: Request, res: Response) => {
    const { locationId } = req.params;
    const result = await this.Service.deleteLocation(locationId);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Location deleted successfully",
      result: result,
    });
  });

  createCommittee = catchAsync(async (req: Request, res: Response) => {
    validateCreateCommittee(req.body);
    const {
      title,
      type,
      location,
      parentLocation,
      president,
      description,
      address,
    } = req.body;
    const result = await this.Service.createCommittee({
      title,
      type,
      location,
      parentLocation,
      president,
      description,
      address,
    });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee created successfully",
      result: result,
    });
  });

  getCommittees = catchAsync(async (req: Request, res: Response) => {
    const result = await this.Service.getCommittees(req.query);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committees fetched successfully",
      result: result.committees,
      meta: result.pagination,
    });
  });

  getCommitteeLocationFilter = catchAsync(async (req: Request, res: Response) => {
    throw new Error("not implemented");
  })

  disbandCommittee = catchAsync(async (req: Request, res: Response) => {
    const { comId } = req.params;
    const result = await this.Service.disbandCommittee(comId);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee disbanded successfully",
      result: result,
    });
  })

  updateCommitteeInformation = catchAsync(async (req: Request, res: Response) => {
    const { comId } = req.params;
    const {
      title,
      description,
      address,
    } = req.body;
    const result = await this.Service.updateCommittee(comId, {
      title,
      description,
      address,
    });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee information updated successfully",
      result: result,
    });
  });

  getCommitteeDetails = catchAsync(async (req: Request, res: Response) => {
    const { comId } = req.params;
    const result = await this.Service.getCommitteeDetails(comId);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee details fetched successfully",
      result: result,
    });
  });

  changePresident = catchAsync(async (req: Request, res: Response) => {
    const { comId } = req.params;
    const { newPresident } = req.body;
    const result = await this.Service.changePresident(comId, newPresident);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "President changed successfully",
      result: result,
    });
  });
}
