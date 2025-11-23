import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import stationRoutes from './routes/stationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import driverAuthRoutes from './routes/driverAuthRoutes.js';
import driverTripRoutes from './routes/driverTripRoutes.js';

const app = express();

// Middleware'ler
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://10.0.2.2:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/driver-auth', driverAuthRoutes);
app.use("/api/trips", tripRoutes); // admin & operator için
app.use("/api/driver-trips", driverTripRoutes); // DRIVER için


// Ana route
app.get('/', (req, res) => {
  res.json({
    message: 'Taxi System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stations: '/api/stations',
      drivers: '/api/drivers',
      trips: '/api/trips',
      driverAuth: '/api/driver-auth',
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;