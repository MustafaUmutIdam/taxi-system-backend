// src/routes/driverRoutes.js
import express from "express";
import { body } from "express-validator";
import driverController from "../controllers/driverController.js";

const router = express.Router();

const driverValidation = [
  body("fullName").trim().notEmpty().withMessage("Driver name is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("licenseNumber").trim().notEmpty().withMessage("License number is required"),
  body("vehiclePlate").trim().notEmpty().withMessage("Vehicle plate is required"),
  body("station").notEmpty().withMessage("Station ID is required"),
];

router.get("/", driverController.getAllDrivers);
router.get("/:id", driverController.getDriverById);
router.post("/", driverValidation, driverController.createDriver);
router.put("/:id", driverValidation, driverController.updateDriver);
router.delete("/:id", driverController.deleteDriver);
router.get("/station/:stationId", driverController.getDriversByStation);

export default router;
