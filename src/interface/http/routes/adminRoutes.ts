import express from "express";

const router = express.Router();

// gets the numerical values for dashboards
router.route("/numbers").get();

// fetches all account requests, and new request counts
router.route("/accout-requests").get().put(); //put marks the messages as read
// to approve reject a request
router.route("/accout-requests/:id").put();

// to get the list of all members
router.route("/members").get();
// to get the details of the memebers
router.route("/members/:id").get().delete().put();


// get all the messages from the users
router.route("/contact-us").get().put(); //put marks the messages as read
// delete messages, and get message details
router.route("/contact-us/:id").get().delete();

// get all committies probably search with name, and create new ones
router.route("/committees").get().post();
// get update delete committiees. 
router.route("/committees/:id").get().put().delete();
// ! assign members from committiess

// get edit request lists probably with new request count
router.route("/edit-requests").get().put(); //put marks the requests as read
router.route("/edit-requests/:id").get().delete();

// get locations, pass null if its division, else all the other palces pass the parent ids
router.route("/locations/:parentId").get();
router.route("/locations/update/:locId").get().put().delete();

// get/create designations
router.route("/designations").get().post()
router.route("/designations/:desId").put().get().delete();

// post notifications for all the users, and alos see it
router.route("/notifications").get().post();
router.route("/notifications/:id").get().delete().put();

export default router;
