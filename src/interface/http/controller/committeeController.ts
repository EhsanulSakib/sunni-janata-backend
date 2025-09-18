import { ICommitteeService } from "../../../infrastructure/services/committeeService";
import { IUserService } from "../../../infrastructure/services/userService"; // Import interface
import catchAsync from "../../../shared/utils/catch_async";
import { Request, Response } from "express";
import sendResponse from "../../../shared/utils/send_response";
import { validateCreateCommittee } from "../validators/validateCommitteeLocation";

export default class CommitteeController {
  Service: ICommitteeService;
  UserService: IUserService;

  constructor(service: ICommitteeService, userService: IUserService) {
    this.Service = service;
    this.UserService = userService; // Initialize UserService instance
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
    console.log("POST /committee request body:", req.body); // Log request body
    validateCreateCommittee(req.body);
    const committee = await this.Service.createCommittee(req.body);
    if (!committee) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: "Failed to create committee",
        result: null
      });
    }

    const designation = await this.UserService.getDesignationByLevel(1);
    if (!designation) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: "Failed to assign committee designation",
        result: null
      });
    }

    const user = await this.UserService.assignCommitteeDesignation(
      req.body.president,
      designation._id as string,
      committee._id
    );
    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: "Failed to assign committee designation",
        result: null
      });
    }

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Committee created successfully",
      result: committee
    });
  });

  updateCommittee = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    // Get old committee first (before update)
    const previousCommittee = await this.Service.getCommitteeById(id);
    if (!previousCommittee) {
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        message: "Committee not found",
        result: null
      });
    }

    const previousPresident = previousCommittee.president;
    const newPresident = req.body.president;

    // Update the committee
    const committee = await this.Service.updateCommittee(id, req.body);
    if (!committee) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: "Failed to update committee",
        result: null
      });
    }

    // Handle president change
    if (previousPresident?.toString() !== newPresident?.toString()) {
      // Reset old president
      if (previousPresident) {
        await this.UserService.removeCommitteeDesignation(
          previousPresident.toString()
        );
      }

      // Assign new president
      if (newPresident) {
        const designation = await this.UserService.getDesignationByLevel(1);
        if (!designation) {
          return sendResponse(res, {
            success: false,
            statusCode: 400,
            message: "Failed to assign committee designation",
            result: null
          });
        }

        await this.UserService.assignCommitteeDesignation(
          newPresident.toString(),
          designation._id as string,
          committee._id as string
        );
      }
    }

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
