# BALAKOSA — Situs Hospitality Dinamis (Node.js + MySQL)

## Cara Menjalankan
```bash
npm install        # sekali saja
npm run seed       # isi database (idempotent, aman diulang)
npm start          # server di http://localhost:3710
```
- Konfigurasi ada di `.env` (jangan di-commit). Contoh ada di `.env.example`.
- Login admin: username `admin`, password `admin123` — **segera ganti** di menu
  Pengaturan → Ganti Password setelah deployment.

## Struktur
```
server/
  index.js   — Express + API publik & admin (JWT)
  db.js      — Pool MySQL + skema (8 tabel)
  seed.js    — Data awal: 4 layanan, 6 artikel wisata Tulungagung,
               5 testimoni, galeri, pengaturan
public/
  index.html  about.html  layanan.html  booking.html  blog.html  kontak.html
  admin.html  — dashboard admin (login, KPI, CRUD)
  style.css   — design system v2 (responsif mobile-first)
  admin.css   admin.js  app.js
```

## Endpoint Utama
Publik: `GET /api/services|posts|posts/:slug|testimonials|gallery|settings|availability`,
`POST /api/bookings`, `POST /api/contact`
Admin (JWT Bearer): `POST /api/auth/login`, `GET /api/admin/overview`,
CRUD `/api/admin/{bookings,services,posts,contacts,testimonials,settings}`

## Database: db_client_balakosa_2026
Tabel: admin_users, services, bookings, posts, contacts, testimonials, gallery, settings.

## Catatan
- Ketersediaan tanggal dihitung otomatis dari booking aktif (status ≠ Batal);
  bentrok tanggal ditolak dengan HTTP 409.
- Foto memakai Unsplash (lisensi bebas pakai); isi artikel bersumber dari
  informasi publik pariwisata Tulungagung.
- Port default 3710 (ubah via `.env`). Hindari PORT=0 di environment.
