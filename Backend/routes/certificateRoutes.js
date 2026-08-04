import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createCertificate,
  getMyCertificates,
  getCertificateByCourse,
  verifyCertificate,
  downloadCertificate,
} from "../controllers/certificateController.js";

const router = express.Router();

// Student Routes
// router.post(
//   "/:courseId/generate",
//   protect,
//   createCertificate
// );

router.get(
  "/",
  protect,
  getMyCertificates
);

router.get(
  "/course/:courseId",
  protect,
  getCertificateByCourse
);

router.get(
  "/:courseId/download",
  protect,
  downloadCertificate
);

// Public Route
router.get(
  "/verify/:certificateId",
  verifyCertificate
);


export default router;

