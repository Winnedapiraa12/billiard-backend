if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const mejaRoutes = require('./routes/mejaRoutes');
const reservasiRoutes = require('./routes/reservasiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint untuk memastikan server menyala
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to BilliardPro API' });
});

// ========================================================================
// RUTE RAHASIA UNTUK MEMBUAT TABEL DI AIVEN (Buka sekali saja di browser)
// ========================================================================
app.get('/api/setup-db', async (req, res) => {
  try {
    await sequelize.sync({ alter: true });
    res.status(200).json({ message: "YEAY! Semua tabel berhasil dibuat di Database Aiven!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat tabel", error: error.message });
  }
});

// ========================================================================
// RUTE SAKTI UNTUK MENAIKKAN PANGKAT USER MENJADI ADMIN
// Cara pakai: buka di browser -> url-backend.vercel.app/api/make-admin/email-kamu@gmail.com
// ========================================================================
app.get('/api/make-admin/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    // Mengubah kolom role menjadi 'admin' di tabel users secara langsung
    await sequelize.query("UPDATE users SET role = 'admin' WHERE email = ?", {
      replacements: [userEmail]
    });
    res.status(200).json({ message: `YEAY! Akun ${userEmail} resmi diangkat menjadi Admin secara permanen!` });
  } catch (error) {
    res.status(500).json({ message: "Gagal menaikkan pangkat", error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/meja', mejaRoutes);
app.use('/api/reservasi', reservasiRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Koneksi Database
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Database terhubung & tersinkronisasi');
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server Backend jalan di http://localhost:${PORT}`);
      });
    })
    .catch(err => console.log('Gagal sync database:', err));
} else {
    // Di Vercel, kita inisialisasi koneksi tanpa sync
    sequelize.authenticate()
    .then(() => console.log('Terkoneksi ke Aiven Database.'))
    .catch(err => console.error('Koneksi Aiven gagal:', err));
}

// FORMAT KHUSUS VERCEL SERVERLESS
module.exports = app;