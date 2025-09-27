import express from "express";
import NotificationRepository from "../../../infrastructure/repositories/notificationRepository";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import NotificationController from "../controller/notificationController";
import NotificationModel from "../../../infrastructure/db/notificationModel";
import { authenticate } from "../middlewares/auth_middleware";
import { UserRoles } from "../../../shared/utils/enums";

const router = express.Router();

const notificationRepository = new NotificationRepository(NotificationModel);
const service = new NotificationService(notificationRepository);
const controller = new NotificationController(service);

router
  .route("/")
  .post(authenticate([UserRoles.Admin]), controller.createNotification)
  .get(controller.getNotifications);

router
  .route("/:id")
  .put(authenticate([UserRoles.Admin]), controller.updateNotification)
  .delete(authenticate([UserRoles.Admin]), controller.deleteNotification);

export default router;