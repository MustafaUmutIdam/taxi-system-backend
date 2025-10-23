import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import stationRoutes from './routes/stationRoutes.js';

const app = express();

// Middleware'ler
app.use(helmet()); // Güvenlik headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
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
app.use('/api/stations', stationRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({
    message: 'Taxi System API',
    version: '1.0.0',
    endpoints: {
      stations: '/api/stations'
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