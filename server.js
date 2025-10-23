import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/database.js';

// Environment variables yükle
dotenv.config();

const PORT = process.env.PORT || 5000;

// Veritabanı bağlantısı
connectDB();

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}`);
});

// Unhandled rejection hatalarını yakala
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});