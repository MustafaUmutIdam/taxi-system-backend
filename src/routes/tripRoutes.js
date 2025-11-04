import express from 'express';
import { body } from 'express-validator';
import tripController from '../controllers/tripController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Validation
const tripValidation = [
  body('station').optional().isMongoId().withMessage('Invalid station ID'),
  body('customer.phone').notEmpty().withMessage('Customer phone required'),
  body('pickup.address').notEmpty().withMessage('Pickup address required'),
  body('pickup.location.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
  body('pickup.location.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
  body('dropoff.address').notEmpty().withMessage('Dropoff address required'),
  body('dropoff.location.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid dropoff latitude'),
  body('dropoff.location.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid dropoff longitude'),
];

// Tüm route'lar authentication gerektiriyor
router.use(protect);

// Trip CRUD
router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.post('/', restrictTo('admin', 'station_manager', 'operator'), tripValidation, tripController.createTrip);
router.post('/:id/resend', restrictTo('admin', 'station_manager', 'operator'), tripController.resendTrip);

// Driver actions (bu route'lar için ayrı driver middleware gerekecek - şimdilik kullanıcı olarak)
router.post('/:id/accept', tripController.acceptTrip);
router.post('/:id/reject', tripController.rejectTrip);
router.post('/:id/start', tripController.startTrip);
router.post('/:id/complete', tripController.completeTrip);

export default router;