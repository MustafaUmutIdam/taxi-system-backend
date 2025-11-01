// src/routes/driverRoutes.js
import express from "express";
import { body } from "express-validator";
import driverController from "../controllers/driverController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Validation
const driverValidation = [
  body("fullName").trim().notEmpty().withMessage("Driver name is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("licenseNumber").trim().notEmpty().withMessage("License number is required"),
  body("vehiclePlate").trim().notEmpty().withMessage("Vehicle plate is required"),
  body("station").notEmpty().withMessage("Station ID is required"),
];

// 🔒 Tüm driver işlemleri authentication gerektirir
router.use(protect);

// --- Routes ---
// Herkes (giriş yapan) şoförleri listeleyebilir
router.get("/", driverController.getAllDrivers);
router.get("/:id", driverController.getDriverById);
router.get("/station/:stationId", driverController.getDriversByStation);

// Sadece admin veya durak yöneticisi şoför ekleyebilir / düzenleyebilir / silebilir
router.post("/", restrictTo("admin", "station_manager"), driverValidation, driverController.createDriver);
router.put("/:id", restrictTo("admin", "station_manager"), driverValidation, driverController.updateDriver);
router.delete("/:id", restrictTo("admin", "station_manager"), driverController.deleteDriver);

export default router;
