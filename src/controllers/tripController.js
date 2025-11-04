import tripService from '../services/tripService.js';
import { validationResult } from 'express-validator';

class TripController {
  // POST /api/trips
  async createTrip(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const trip = await tripService.createTrip(req.body, req.user._id);

      res.status(201).json({
        success: true,
        message: 'Trip created and assigned to nearest driver',
        data: trip
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/trips
  async getAllTrips(req, res) {
    try {
      const filters = {
        status: req.query.status,
        station: req.query.station,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const trips = await tripService.getAllTrips(filters, req.user._id, req.user.role);

      res.status(200).json({
        success: true,
        count: trips.length,
        data: trips
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/trips/:id
  async getTripById(req, res) {
    try {
      const trip = await tripService.getTripById(req.params.id, req.user._id, req.user.role);

      res.status(200).json({
        success: true,
        data: trip
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/trips/:id/resend
  async resendTrip(req, res) {
    try {
      const trip = await tripService.resendTrip(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Trip resent to drivers',
        data: trip
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/trips/:id/accept (Driver endpoint)
  async acceptTrip(req, res) {
    try {
      const trip = await tripService.acceptTrip(req.params.id, req.driver._id);

      res.status(200).json({
        success: true,
        message: 'Trip accepted',
        data: trip
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/trips/:id/reject (Driver endpoint)
  async rejectTrip(req, res) {
    try {
      const { reason } = req.body;
      const trip = await tripService.rejectTrip(req.params.id, req.driver._id, reason);

      res.status(200).json({
        success: true,
        message: 'Trip rejected, assigned to next driver',
        data: trip
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/trips/:id/start (Driver endpoint)
  async startTrip(req, res) {
    try {
      const driverId = req.driver?._id || req.user?._id || '690747f7ddd7a37537d0468a'; // <-- test driver ID
      const trip = await tripService.startTrip(req.params.id, driverId);

      res.status(200).json({
        success: true,
        message: 'Trip started',
        data: trip
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/trips/:id/complete (Driver endpoint)
  async completeTrip(req, res) {
  try {
    const { actualFare } = req.body;

    // Login yapılmadıysa test amaçlı default driverId kullan
    const driverId = req.driver?._id || req.user?._id || '690747f7ddd7a37537d0468a';

    const trip = await tripService.completeTrip(req.params.id, driverId, actualFare);

    res.status(200).json({
      success: true,
      message: 'Trip completed',
      data: trip
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
}

export default new TripController();