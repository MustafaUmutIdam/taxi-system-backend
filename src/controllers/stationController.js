import stationService from '../services/stationService.js';
import { validationResult } from 'express-validator';

class StationController {
  // GET /api/stations
  async getAllStations(req, res, next) {
    try {
      const { search } = req.query;
      const stations = await stationService.getAllStations(
        { search }, 
        req.user._id, 
        req.user.role
      );
      
      res.status(200).json({
        success: true,
        count: stations.length,
        data: stations
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/stations/:id
  async getStationById(req, res, next) {
    try {
      const station = await stationService.getStationById(
        req.params.id, 
        req.user._id, 
        req.user.role
      );
      
      res.status(200).json({
        success: true,
        data: station
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/stations
  async createStation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const station = await stationService.createStation(req.body, req.user._id);
      
      res.status(201).json({
        success: true,
        message: 'Station created successfully',
        data: station
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/stations/:id
  async updateStation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const station = await stationService.updateStation(
        req.params.id,
        req.body,
        req.user._id,
        req.user.role
      );
      
      res.status(200).json({
        success: true,
        message: 'Station updated successfully',
        data: station
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/stations/:id
  async deleteStation(req, res, next) {
    try {
      await stationService.deleteStation(req.params.id, req.user._id, req.user.role);
      
      res.status(200).json({
        success: true,
        message: 'Station deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/stations/nearby
  async getNearbyStations(req, res, next) {
    try {
      const { lat, lng, distance } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const stations = await stationService.getNearbyStations(
        parseFloat(lat),
        parseFloat(lng),
        distance ? parseInt(distance) : 5000
      );
      
      res.status(200).json({
        success: true,
        count: stations.length,
        data: stations
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new StationController();