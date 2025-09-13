import express from "express";
import { AutoEncryptionLoggerLevel } from "mongodb";
import { authenticate } from "../middlewares/auth_middleware";
import { UserRoles } from "../../../shared/utils/enums";
import CommitteeRepository from "../../../infrastructure/repositories/committeeRepository";
import CommitteeModel from "../../../infrastructure/db/committeeModel";
import LocationModel from "../../../infrastructure/db/locationModel";
import LocationRepository from "../../../infrastructure/repositories/locationRepository";
import CommitteeLocationService from "../../../infrastructure/services/committeeLocationService";
import CommitteeLocationController from "../controller/CommitteeLocationController";
import UserRepository from "../../../infrastructure/repositories/userRepository";
import UserModel from "../../../infrastructure/db/userModel";
import DesignationRepository from "../../../infrastructure/repositories/designationRepository";
import DesignationModel from "../../../infrastructure/db/designationModel";

const router = express.Router();

const locationRepository = new LocationRepository(LocationModel);
const committeeRepository = new CommitteeRepository(CommitteeModel);
const userRepository = new UserRepository(UserModel);
const designationRepository = new DesignationRepository(DesignationModel);

const service = new CommitteeLocationService(
  locationRepository,
  committeeRepository,
  userRepository,
  designationRepository
);
const controller = new CommitteeLocationController(service);

router
  .route("/location")
  .post(authenticate([UserRoles.Admin]), controller.createLocation);

router.route("/location/:parentId").get(controller.getLocationsByParent);
router
  .route("/location/edit/:locationId")
  .get(controller.getLocationDetails)
  .put(authenticate([UserRoles.Admin]), controller.updateLocation)
  .delete(authenticate([UserRoles.Admin]), controller.deleteLocation);

router
  .route("/committee")
  .post(authenticate([UserRoles.Admin]), controller.createCommittee)
  .get(controller.getCommittees);


router
  .route("/committee/:comId")
  .get(controller.getCommitteeDetails)
  .post(authenticate([UserRoles.Admin]), controller.changePresident)
  .put(authenticate([UserRoles.Admin]), controller.updateCommitteeInformation)
  .delete(authenticate([UserRoles.Admin]), controller.disbandCommittee);

export default router;
