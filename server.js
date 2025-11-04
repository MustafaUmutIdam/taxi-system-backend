import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import tripTimeoutJob from './src/jobs/tripTimeoutJob.js';
import tripService from './src/services/tripService.js';
import { resetStuckDrivers } from './src/services/driverService.js'; 

// Environment variables yükle
dotenv.config();

const PORT = process.env.PORT || 3000;

// Veritabanı bağlantısı
connectDB();

// Sunucuyu başlat
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}`);
  
  // Trip timeout job'unu başlat
  tripTimeoutJob.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  tripTimeoutJob.stop();
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  tripTimeoutJob.stop();
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

// Unhandled rejection hatalarını yakala
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  tripTimeoutJob.stop();
  server.close(() => {
    process.exit(1);
  });
});

setInterval(async () => {
  const expiredCount = await tripService.checkExpiredAssignments();
  if (expiredCount > 0) console.log(`✅ ${expiredCount} expired trips processed`);
}, 10000); // her 10 saniyede bir kontrol et

// Her 1 dakikada bir stuck driver resetleme
setInterval(async () => {
  await resetStuckDrivers();
}, 10000);