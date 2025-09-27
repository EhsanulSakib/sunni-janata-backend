import express from "express";
import PresidentRepository from "../../../infrastructure/repositories/presidentRepository";
import PresidentController from "../controller/presidentController";
import PresidentModel from "../../../infrastructure/db/presidentModel";
import { authenticate } from "../middlewares/auth_middleware";
import { UserRoles } from "../../../shared/utils/enums";
import { PresidentService } from "../../../infrastructure/services/presidentService";
import multer from "multer"; // Import Multer

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory (suitable for Cloudinary)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

const presidentRepository = new PresidentRepository(PresidentModel);
const service = new PresidentService(presidentRepository);
const controller = new PresidentController(service);

router
  .route("/president/quote")
  .get(controller.getPresidentQuote);

router
  .route("/president/quote/:id")
  .put(
    authenticate([UserRoles.Admin]),
    upload.single("image"), // Multer middleware to handle single file upload with field name 'image'
    controller.updatePresidentQuote
  );

export default router;