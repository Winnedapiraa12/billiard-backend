// Nyalakan dotenv hanya jika berjalan di komputer lokal (bukan production)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const mejaRoutes = require('./routes/mejaRoutes');
const reservasiRoutes = require('./routes/reservasiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========================================================================
// Mount Routes (MENGGUNAKAN /api AGAR TERSAMBUNG DENGAN FRONTEND)
// ========================================================================
app.use('/api/auth', authRoutes);
app.use('/api/meja', mejaRoutes);
app.use('/api/reservasi', reservasiRoutes);

// Error Handler Global (Menangkap semua error agar server tidak mati)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;

// ========================================================================
// MANAJEMEN DATABASE & SERVER
// ========================================================================

// HANYA LAKUKAN SYNC & LISTEN DI LOKAL. JANGAN DI VERCEL!
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Database terhubung & tersinkronisasi');
      app.listen(PORT, () => {
        console.log(`Server Backend jalan di http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.log('Gagal sync database:', err);
    });
} else if (process.env.NODE_ENV === 'production') {
  // Jika di Vercel (production), langsung informasikan tanpa melakukan sync
  console.log('Mode Production berjalan di Vercel. Database siap diakses.');
}

// WAJIB DITAMBAHKAN: Export app agar bisa dipanggil oleh file test (Supertest) dan Vercel
module.exports = app;