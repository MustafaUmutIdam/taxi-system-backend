import express from 'express';
import { body } from 'express-validator';
import driverAuthController from '../controllers/driverAuthController.js';
import { protectDriver } from '../middleware/driverAuth.js';

const router = express.Router();

// Validation
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Ad soyad gereklidir'),
  body('phone').trim().notEmpty().withMessage('Telefon gereklidir'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  body('licenseNumber').trim().notEmpty().withMessage('Sürücü belgesi gereklidir'),
  body('vehiclePlate').trim().notEmpty().withMessage('Plaka gereklidir'),
  body('station').isMongoId().withMessage('Geçerli durak ID gereklidir'),
];

// Public routes
router.post('/register', registerValidation, driverAuthController.register);
router.post('/login', driverAuthController.login);

// Protected routes
router.get('/me', protectDriver, driverAuthController.getMe);
router.put('/profile', protectDriver, driverAuthController.updateProfile);
router.put('/change-password', protectDriver, driverAuthController.changePassword);

export default router;