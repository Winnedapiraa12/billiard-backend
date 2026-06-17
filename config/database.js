// Konfigurasi koneksi database MySQL menggunakan Sequelize
const { Sequelize } = require('sequelize');
require('mysql2'); // <-- Memaksa Vercel membawa driver MySQL agar tidak error

// Setup konfigurasi dasar
const dbOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false, // Matikan log query agar terminal bersih
};

// Logika Pintar: 
// Nyalakan konfigurasi keamanan SSL HANYA jika terhubung ke Aiven atau di Vercel (production).
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