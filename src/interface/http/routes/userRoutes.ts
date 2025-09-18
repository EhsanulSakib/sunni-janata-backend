import expreee from "express";
import UserRepository from "../../../infrastructure/repositories/userRepository";
import UserModel from "../../../infrastructure/db/userModel";
import UserService from "../../../infrastructure/services/userService";
import UserController from "../controller/userController";
import { upload } from "../middlewares/multer";
import { UserRoles } from "../../../shared/utils/enums";
import { authenticate } from "../middlewares/auth_middleware";
import LocationRepository from "../../../infrastructure/repositories/locationRepository";
import LocationModel from "../../../infrastructure/db/locationModel";
import CommitteeRepository from "../../../infrastructure/repositories/committeeRepository";
import CommitteeModel from "../../../infrastructure/db/committeeModel";
import DesignationRepository from "../../../infrastructure/repositories/designationRepository";
import DesignationModel from "../../../infrastructure/db/designationModel";

const router = expreee.Router();

const userRepository = new UserRepository(UserModel);
const location = new LocationRepository(LocationModel);
const committee = new CommitteeRepository(CommitteeModel);
const designation = new DesignationRepository(DesignationModel);
const service = new UserService(userRepository, location, committee, designation);
const controller = new UserController(service);

// used to register a form
router
  .route("/register-req")
  .post(upload.single("avatar"), controller.requestRegistration);
// // verify the otp after registration
router.route("/request-otp").post(controller.requestOtp);

router.route("/otp-verify").post(controller.verifyOtp);

router.route("/delete-user/:id").delete(authenticate([UserRoles.Admin]), controller.deleteUserById);

router
  .route("/account-status/:id")
  .put(authenticate([UserRoles.Admin]), controller.updateAccountStatus);
  
router
  .route("/account-status/:status")
  .get(authenticate([UserRoles.Admin]), controller.getAccountsByStatus);

// // login
router.route("/login").post(controller.loginUser);

router
  .route("/change-password")
  .post(authenticate([UserRoles.User]), controller.changePassword);
router.route("/forget-password").post(controller.forgetPassword);

router.route("/my-profile").get(authenticate([UserRoles.User]), controller.getMyProfile);
router.route("/profile/:id").get(authenticate(), controller.getProfileWithId);

router.route("/assign-committee-designation/:userId").put(authenticate([UserRoles.Admin]), controller.assignCommitteeDesignation);
router.route("/remove-committee-designation/:userId").post(authenticate([UserRoles.Admin]), controller.removeCommitteeDesignation);

router.route("/get-users-by-committee/:userId").get(controller.getAllUserByCommitteeId);

export default router;
