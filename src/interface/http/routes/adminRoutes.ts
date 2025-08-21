import express from "express";
import AdminController from "../controller/adminController";
import AdminRepository from "../../../infrastructure/repositories/adminRepository";
import AdminModel from "../../../infrastructure/db/adminModel";
import AdminService from "../../../infrastructure/services/adminService";

const router = express.Router();

// controller setup
const adminRepository = new AdminRepository(AdminModel);
const service = new AdminService(adminRepository);
const controller = new AdminController(service);

// authentication
router.route("/register").post(controller.register);
router.route("/login").post(controller.login).put(controller.changePassword);

// dashoard numbers
router.route("/numbers").get(controller.getNumbers);

// fetches all account requests, and new request counts
router
  .route("/accout-requests")
  .get(controller.getAccountRequests)
  .put(controller.markAccountRequestsRead); //put marks the messages as read

// // to approve reject a request
// router.route("/accout-requests/:id").put();

// // to get the list of all members
// router.route("/members").get();
// // to get the details of the memebers
// router.route("/members/:id").get().delete().put();



// // get all committies probably search with name, and create new ones
// router.route("/committees").get().post();
// // get update delete committiees.
// router.route("/committees/:id").get().put().delete();
// // ! assign members from committiess

// // get edit request lists probably with new request count
// router.route("/edit-requests").get().put(); //put marks the requests as read
// router.route("/edit-requests/:id").get().delete();

// // get locations, pass null if its division, else all the other palces pass the parent ids
// router.route("/locations/:parentId").get();
// router.route("/locations/update/:locId").get().put().delete();

// // get/create designations
// router.route("/designations").get().post();
// router.route("/designations/:desId").put().get().delete();

// // post notifications for all the users, and alos see it
// router.route("/notifications").get().post();
// router.route("/notifications/:id").get().delete().put();

export default router;
