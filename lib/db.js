import { Pool } from 'pg';

let pool;

try {
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    // SSL gerekiyorsa ekle (Railway için genelde gerekir)
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('railway') ? { rejectUnauthorized: false } : false
  });
} catch (error) {
  console.error("Veritabanı bağlantı havuzu oluşturulamadı:", error);
}

export async function query(text, params) {
  if (!pool) {
    console.warn("Veritabanı bağlantısı yok, boş veri dönülüyor.");
    return { rows: [] }; // Test ortamında boş döner, çökmez.
  }
  return pool.query(text, params);
}