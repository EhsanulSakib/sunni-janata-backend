import { ICommitteeService } from "../../../infrastructure/services/committeeService";
import catchAsync from "../../../shared/utils/catch_async";
import { Request, Response } from "express";
import sendResponse from "../../../shared/utils/send_response";
import { validateCreateCommittee } from "../validators/validateCommitteeLocation";

export default class CommitteeController {
  Service: ICommitteeService;

  constructor(service: ICommitteeService) {
    this.Service = service;
  }

  getCommittees = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const committees = await this.Service.getCommittee(query);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committees retrieved successfully",
      result: committees
    });
  });

  getCommitteeById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const committee = await this.Service.getCommitteeById(id);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee retrieved successfully",
      result: committee
    });
  });

  createCommittee = catchAsync(async (req: Request, res: Response) => {
    validateCreateCommittee(req.body);
    const committee = await this.Service.createCommittee(req.body);
    
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee created successfully",
      result: committee
    });
  });

  updateCommittee = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const committee = await this.Service.updateCommittee(id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee updated successfully",
      result: committee
    });
  });

  deleteCommittee = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const committee = await this.Service.deleteCommittee(id);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee deleted successfully",
      result: committee
    });
  });
}
