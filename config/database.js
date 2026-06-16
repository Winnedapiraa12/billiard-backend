// Konfigurasi koneksi database MySQL menggunakan Sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Setup konfigurasi dasar
const dbOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Menambahkan deteksi port khusus Aiven
  dialect: 'mysql',
  logging: false, // Matikan log query agar terminal bersih
};

// Logika Pintar: 
// Nyalakan konfigurasi keamanan SSL HANYA jika terhubung ke Aiven atau di Vercel (production).
// Ini agar XAMPP di laptop kamu tetap bisa berjalan normal tanpa error SSL.
if (process.env.NODE_ENV === 'production' || (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud'))) {
  dbOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  dbOptions
);

module.exports = sequelize;