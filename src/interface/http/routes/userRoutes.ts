import expreee from "express";

const router = expreee.Router();

// used to register a form
router.route("/register-req").post();
// verify the otp after registration
router.route("/otp-verify").post();
// login
router.route("/login").post()
// send edit requests
router.route("/request-edit").post();
//get profile info
router.route("/profile").get();
// send message to admin
router.route("/contact").post();

// get all committeess
router.route("/committees").get();
// get committee details
router.route("/committees/:id").get();
// get committees with locations

// get all notifications
router.route("/notifications").get();
// get notification details
router.route("/notifications/:id").post();


export default router;