
import express from 'express';
import { body } from 'express-validator';
import driverController from '../controllers/driverController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Validation
const driverValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name required'),
  body('phone').trim().notEmpty().withMessage('Phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('licenseNumber').trim().notEmpty().withMessage('License number required'),
  body('vehiclePlate').trim().notEmpty().withMessage('Vehicle plate required'),
  body('station').isMongoId().withMessage('Valid station ID required'),
];

// PUBLIC route - Driver registration (mobil uygulama için)
router.post('/', driverValidation, driverController.createDriver);

// Protected routes
router.use(protect);

router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.get('/station/:stationId', driverController.getDriversByStation);
router.put('/:id', restrictTo('admin', 'station_manager'), driverController.updateDriver);
router.delete('/:id', restrictTo('admin', 'station_manager'), driverController.deleteDriver);
router.patch('/:id/status', driverController.updateDriverStatus);
router.patch('/:id/location', driverController.updateDriverLocation);

export default router;