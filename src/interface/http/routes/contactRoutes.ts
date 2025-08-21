import express from "express";
import ContactMessageController from "../controller/contactMessageController";
import ContactMessageRepository from "../../../infrastructure/repositories/contactMessageRepository";
import ContactMessageModel from "../../../infrastructure/db/contactMessageModel";
import { ContactMessageService } from "../../../infrastructure/services/contactMessageService";

const router = express.Router();

// controller set up
const contactMessageRepository = new ContactMessageRepository(ContactMessageModel);
const service = new ContactMessageService(contactMessageRepository);
const controler = new ContactMessageController(service);

// 📌 routes
router
  .route("/")
  .get(controler.getAllContactMessages)
  .put(controler.markContactMessagesRead) //put marks the messages as read
  .post(controler.sendContactMessage);

router
  .route("/:id")
  .get(controler.getContactMessageDetails)
  .delete(controler.deleteContactMessage);

export default router;
