import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  getUsers,
  updateUserRole,
  deleteUser,
  createCounselor,
  updateCounselor,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getUsers);

router.post("/counselors", protect, authorizeRoles("admin"), createCounselor);

router.put(
  "/counselors/:id",
  protect,
  authorizeRoles("admin"),
  updateCounselor,
);

router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);

router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
