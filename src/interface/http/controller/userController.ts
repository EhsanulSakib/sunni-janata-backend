import { Request, Response } from "express";
import catchAsync from "../../../shared/utils/catch_async";

export default class UserController {
  requestRegistration = catchAsync(async (req: Request, res: Response) => {});
}
