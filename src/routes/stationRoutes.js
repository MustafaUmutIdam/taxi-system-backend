import express from 'express';
import { body } from 'express-validator';
import stationController from '../controllers/stationController.js';

const router = express.Router();

// Validation middleware'leri
const stationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Station name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
];

// Routes
router.get('/nearby', stationController.getNearbyStations);
router.get('/', stationController.getAllStations);
router.get('/:id', stationController.getStationById);
router.post('/', stationValidation, stationController.createStation);
router.put('/:id', stationValidation, stationController.updateStation);
router.delete('/:id', stationController.deleteStation);

export default router;