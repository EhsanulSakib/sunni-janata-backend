import expreee from "express";
import UserRepository from "../../../infrastructure/repositories/userRepository";
import UserModel from "../../../infrastructure/db/userModel";
import UserService from "../../../infrastructure/services/userService";
import UserController from "../controller/userController";
import { upload } from "../middlewares/multer";

const router = expreee.Router();

const userRepository = new UserRepository(UserModel);
const service = new UserService(userRepository);
const controller = new UserController(service);

// used to register a form
router.route("/register-req").post(upload.single("avatar"),controller.requestRegistration);
// // verify the otp after registration
router.route("/request-otp").post(controller.requestOtp);

// router.route("/otp-verify").post();
// // login
// router.route("/login").post()
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