import express from "express";
import CommitteeRepository from "../../../infrastructure/repositories/committeeRepository";
import CommitteeModel from "../../../infrastructure/db/committeeModel";
import { CommitteeService } from "../../../infrastructure/services/committeeService";
import CommitteeController from "../controller/committeeController";
import { UserRoles } from "../../../shared/utils/enums";
import { authenticate } from "../middlewares/auth_middleware";
import UserService from "../../../infrastructure/services/userService";
import UserRepository from "../../../infrastructure/repositories/userRepository";
import UserModel from "../../../infrastructure/db/userModel"; // Import UserModel
import LocationRepository from "../../../infrastructure/repositories/locationRepository";
import DesignationRepository from "../../../infrastructure/repositories/designationRepository";
import LocationModel from "../../../infrastructure/db/locationModel";
import DesignationModel from "../../../infrastructure/db/designationModel";

const router = express.Router();

const committeeRepository = new CommitteeRepository(CommitteeModel);
const userRepository = new UserRepository(UserModel); 
const locationRepository = new LocationRepository(LocationModel);
const designationRepository = new DesignationRepository(DesignationModel); 
const service = new CommitteeService(committeeRepository);
const userService = new UserService(userRepository, locationRepository, committeeRepository, designationRepository);
const controller = new CommitteeController(service, userService);

router
  .route("/")
  .get(controller.getCommittees)
  .post(authenticate([UserRoles.Admin]), controller.getCommittees);

router
  .route("/")

router
  .route("/create") 
  .post(authenticate([UserRoles.Admin]), controller.createCommittee);

router.route("/:id").get(controller.getCommitteeById);

router
  .route("/update/:id")
  .put(authenticate([UserRoles.Admin]), controller.updateCommittee);

router
  .route("/:id")
  .delete(authenticate([UserRoles.Admin]), controller.deleteCommittee);

export default router;
