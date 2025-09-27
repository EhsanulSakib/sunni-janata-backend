import express from "express";
import ConstitutionRepository from "../../../infrastructure/repositories/constitutionRepository";
import ConstitutionController from "../controller/constitutionController";
import ConstitutionModel from "../../../infrastructure/db/constitutionModel";
import { authenticate } from "../middlewares/auth_middleware";
import { UserRoles } from "../../../shared/utils/enums";
import { ConstitutionService } from "../../../infrastructure/services/constitutionService";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

const constitutionRepository = new ConstitutionRepository(ConstitutionModel);
const service = new ConstitutionService(constitutionRepository);
const controller = new ConstitutionController(service);

router
  .route("/")
  .get(controller.getConstitution)
  .put(
    authenticate([UserRoles.Admin]),
    upload.single("pdf"),
    controller.updateConstitution
  );

export default router;