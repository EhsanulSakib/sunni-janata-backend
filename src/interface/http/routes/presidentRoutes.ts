import express from "express";
import PresidentRepository from "../../../infrastructure/repositories/presidentRepository";
import PresidentController from "../controller/presidentController";
import PresidentModel from "../../../infrastructure/db/presidentModel";
import { authenticate } from "../middlewares/auth_middleware";
import { UserRoles } from "../../../shared/utils/enums";
import { PresidentService } from "../../../infrastructure/services/presidentService";

const router = express.Router();

const presidentRepository = new PresidentRepository(PresidentModel);
const service = new PresidentService(presidentRepository);
const controller = new PresidentController(service);

router
  .route("/president/quote")
  .get(controller.getPresidentQuote);

router
  .route("/president/quote/:id")
  .put(authenticate([UserRoles.Admin]), controller.updatePresidentQuote); 

export default router;