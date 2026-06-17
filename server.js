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