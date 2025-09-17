import express from "express";
import CommitteeRepository from "../../../infrastructure/repositories/committeeRepository";
import CommitteeModel from "../../../infrastructure/db/committeeModel";
import { CommitteeService } from "../../../infrastructure/services/committeeService";
import CommitteeController from "../controller/committeeController";
import { UserRoles } from "../../../shared/utils/enums";
import { authenticate } from "../middlewares/auth_middleware";

const router = express.Router();

const committeeRepository = new CommitteeRepository(CommitteeModel);
const service = new CommitteeService(committeeRepository);
const controller = new CommitteeController(service);

router
  .route("/")
  .get(controller.getCommittees)
  .post(authenticate([UserRoles.Admin]), controller.getCommittees);

router.route("/:id").get(controller.getCommitteeById)
router.route("/").post(authenticate([UserRoles.Admin]), controller.createCommittee);
router.route("/:id").put(authenticate([UserRoles.Admin]), controller.updateCommittee);
router.route("/:id").delete(authenticate([UserRoles.Admin]), controller.deleteCommittee);

export default router;


