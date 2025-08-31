import expreee from "express";
import UserRepository from "../../../infrastructure/repositories/userRepository";
import UserModel from "../../../infrastructure/db/userModel";
import UserService from "../../../infrastructure/services/userService";
import UserController from "../controller/userController";
import { upload } from "../middlewares/multer";
import { UserRoles } from "../../../shared/utils/enums";
import { authenticate } from "../middlewares/auth_middleware";

const router = expreee.Router();

const userRepository = new UserRepository(UserModel);
const service = new UserService(userRepository);
const controller = new UserController(service);

// used to register a form
router
  .route("/register-req")
  .post(upload.single("avatar"), controller.requestRegistration);
// // verify the otp after registration
router.route("/request-otp").post(controller.requestOtp);

router.route("/otp-verify").post(controller.verifyOtp);

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
// // send edit requests
// router.route("/request-edit").post();
// //get profile info
// router.route("/profile").get();
// // send message to admin
// router.route("/contact").post();

// // get all committeess
// router.route("/committees").get();
// // get committee details
// router.route("/committees/:id").get();
// // get committees with locations

// // get all notifications
// router.route("/notifications").get();
// // get notification details
// router.route("/notifications/:id").post();

export default router;
