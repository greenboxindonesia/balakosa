import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/* TiDB Cloud / MySQL.
   - DB_SSL=true (atau host mengandung "tidbcloud") mengaktifkan TLS, wajib untuk TiDB Cloud.
   - DB_CONN_LIMIT disarankan kecil (mis. 5) untuk lingkungan serverless seperti Vercel. */
const useSSL = String(process.env.DB_SSL || '').toLowerCase() === 'true'
  || /tidbcloud|tidb/i.test(process.env.DB_HOST || '');

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_client_balakosa_2026',
  waitForConnections: true,
  connectionLimit: +(process.env.DB_CONN_LIMIT || 10),
  namedPlaceholders: true,
  charset: 'utf8mb4_general_ci',
  dateStrings: true,
  ...(useSSL ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } } : {}),
});

export async function q(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function initSchema() {
  await q(`CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL DEFAULT 'Administrator',
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(64) NOT NULL,
    icon VARCHAR(16) NOT NULL DEFAULT '🏨',
    tagline VARCHAR(160) NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    features JSON NOT NULL,
    rules TEXT NULL,
    price INT NOT NULL,
    unit VARCHAR(24) NOT NULL DEFAULT 'malam',
    image VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(24) NOT NULL UNIQUE,
    service_id INT NOT NULL,
    guest_name VARCHAR(120) NOT NULL,
    guest_phone VARCHAR(24) NOT NULL,
    guests INT NOT NULL DEFAULT 1,
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    payment_method VARCHAR(24) NOT NULL DEFAULT 'dp',
    total INT NOT NULL DEFAULT 0,
    status ENUM('Menunggu','Dikonfirmasi','Lunas','Batal') NOT NULL DEFAULT 'Menunggu',
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_dates (service_id, checkin, checkout),
    INDEX idx_status (status),
    CONSTRAINT fk_booking_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'Tips',
    excerpt VARCHAR(400) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    read_minutes INT NOT NULL DEFAULT 5,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cat (category)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(120) NOT NULL DEFAULT 'Tamu',
    rating TINYINT NOT NULL DEFAULT 5,
    content TEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    caption VARCHAR(160) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}
