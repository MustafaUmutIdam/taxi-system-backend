import express from "express";
import { protectDriver } from "../middleware/driverAuth.js";
import tripController from "../controllers/tripController.js";

const router = express.Router();

// Tüm işlemler driver token gerektirir
router.use(protectDriver);

// Aktif trip
router.get("/active", tripController.getActiveTrip);

// Trip detay
router.get("/:id", tripController.getTripById);

// Driver işlemleri
router.post("/:id/accept", tripController.acceptTrip);
router.post("/:id/reject", tripController.rejectTrip);
router.post("/:id/start", tripController.startTrip);
router.post("/:id/complete", tripController.completeTrip);

export default router;
