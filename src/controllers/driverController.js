// src/controllers/driverController.js
import { validationResult } from "express-validator";
import driverService from "../services/driverService.js";

class DriverController {
  async getAllDrivers(req, res, next) {
    try {
      const { search, stationId } = req.query;
      const drivers = await driverService.getAllDrivers({ search, stationId });
      return res.status(200).json({ success: true, count: drivers.length, data: drivers });
    } catch (err) {
      next(err);
    }
  }

  async getDriverById(req, res, next) {
    try {
      const driver = await driverService.getDriverById(req.params.id);
      return res.status(200).json({ success: true, data: driver });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  async createDriver(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const driver = await driverService.createDriver(req.body);
      return res.status(201).json({ success: true, message: "Driver created successfully", data: driver });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateDriver(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const driver = await driverService.updateDriver(req.params.id, req.body);
      return res.status(200).json({ success: true, message: "Driver updated successfully", data: driver });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteDriver(req, res, next) {
    try {
      await driverService.deleteDriver(req.params.id);
      return res.status(200).json({ success: true, message: "Driver deleted successfully" });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  async getDriversByStation(req, res, next) {
    try {
      const drivers = await driverService.getDriversByStation(req.params.stationId);
      return res.status(200).json({ success: true, data: drivers });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateDriverStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }
      const driver = await driverService.updateDriverStatus(req.params.id, status);
      return res.status(200).json({ success: true, message: 'Driver status updated successfully', data: driver });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateDriverLocation(req, res, next) {
    try {
      const { lat, lng } = req.body;
      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
      }
      const driver = await driverService.updateDriverLocation(req.params.id, { lat, lng });
      return res.status(200).json({ success: true, message: 'Driver location updated successfully', data: driver });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

export default new DriverController();