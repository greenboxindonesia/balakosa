# Panduan Deploy BALAKOSA ke Vercel + TiDB Cloud

Arsitektur: **frontend statis & API Express** di-host di **Vercel**, sedangkan **database MySQL** di-host di **TiDB Cloud Serverless**. Keduanya dihubungkan lewat environment variable.

```
Browser ──▶ Vercel (static public/ + Serverless Function api/index.js)
                       │
                       └──▶ TiDB Cloud Serverless (MySQL, port 4000, TLS)
```

File terkait di repo:
- `vercel.json` — konfigurasi routing Vercel (static dari `public/`, `/api/*` ke function).
- `api/index.js` — entrypoint serverless yang memakai Express app (`server/app.js`).
- `server/db.js` — koneksi database (mendukung TLS TiDB + `DB_CONN_LIMIT`).
- `database/balakosa.sql` — dump database untuk diimpor ke TiDB.

---

## Prasyarat
- Akun [GitHub](https://github.com) (repo sudah ada: `greenboxindonesia/balakosa`).
- Akun [Vercel](https://vercel.com) (bisa login dengan GitHub).
- Akun [TiDB Cloud](https://tidbcloud.com) (ada paket Serverless gratis).
- MySQL client (`mysql`/`mysqldump`) untuk impor dari komputer, atau cukup pakai SQL Editor web TiDB.

---

## Bagian A — Menyiapkan Database di TiDB Cloud

1. Masuk ke https://tidbcloud.com → **Create Cluster** → pilih **Serverless**.
2. Pilih region terdekat (mis. `Singapore / ap-southeast-1`), beri nama cluster, lalu **Create**.
3. Setelah cluster aktif, buka **Connect** dan catat kredensial:
   - **Host**: contoh `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - **Port**: `4000`
   - **User**: contoh `3xxxxxx.root` (perhatikan ada prefix angka)
   - **Password**: klik *Generate Password*, simpan.
4. Buat database. Buka **SQL Editor** (atau Connect → Web SQL Shell) lalu jalankan:
   ```sql
   CREATE DATABASE db_client_balakosa_2026 CHARACTER SET utf8mb4;
   ```
   > Atau gunakan nama database lain, asalkan sama dengan `DB_NAME` di Vercel.

---

## Bagian B — Mengunggah Database (`database/balakosa.sql`) ke TiDB

Pilih salah satu cara:

### Opsi 1 — MySQL CLI (paling mudah)
```bash
mysql --host <TIDB_HOST> --port 4000 \
      --user '<TIDB_USER>' --password \
      --ssl-mode=REQUIRED \
      db_client_balakosa_2026 < database/balakosa.sql
```
- Ganti `<TIDB_HOST>` dan `<TIDB_USER>` sesuai kredensial Anda.
- `--ssl-mode=REQUIRED` wajib karena TiDB Cloud memaksa TLS.
- Setelah selesai, cek: `SHOW TABLES;` harus menampilkan 8 tabel.

### Opsi 2 — SQL Editor web TiDB Cloud
1. Buka cluster → **SQL Editor** → pilih database `db_client_balakosa_2026`.
2. Buka isi file `database/balakosa.sql`, salin isinya, tempel ke editor, lalu **Run**.
   (Jika file besar, gunakan Opsi 1 atau Opsi 3.)

### Opsi 3 — Import Data (untuk file besar)
Unggah `database/balakosa.sql` ke cloud storage (mis. S3/GCS), lalu gunakan fitur **Import** di TiDB Cloud dan arahkan ke database `db_client_balakosa_2026`.

> Dump sudah dibersihkan dari collation khusus MySQL 8 (`utf8mb4_0900_ai_ci`) agar kompatibel dengan TiDB.

---

## Bagian C — Deploy ke Vercel

### Cara 1 — Lewat Dashboard (disarankan)
1. Masuk https://vercel.com → **Add New… → Project** → **Import Git Repository** → pilih `balakosa`.
2. Konfigurasi:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: (kosongkan)
   - **Output Directory**: `public` (sudah diatur di `vercel.json`)
3. Buka **Environment Variables**, isi (Production + Preview):
   | Key | Value |
   |-----|-------|
   | `DB_HOST` | host TiDB, mis. `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
   | `DB_PORT` | `4000` |
   | `DB_USER` | user TiDB, mis. `3xxxxxx.root` |
   | `DB_PASSWORD` | password TiDB |
   | `DB_NAME` | `db_client_balakosa_2026` |
   | `DB_SSL` | `true` |
   | `DB_CONN_LIMIT` | `5` |
   | `JWT_SECRET` | string acak panjang (mis. hasil `openssl rand -hex 32`) |
   | `ADMIN_USERNAME` | `admin` (opsional) |
   | `ADMIN_PASSWORD` | password admin baru (opsional) |
4. Klik **Deploy**. Setelah selesai, Vercel memberi URL seperti `https://balakosa.vercel.app`.

### Cara 2 — Lewat Vercel CLI
```bash
npm i -g vercel
vercel login
vercel            # deploy preview, ikuti wizard (Framework: Other)
# Tambahkan environment variable:
vercel env add DB_HOST production
vercel env add DB_PORT production
vercel env add DB_USER production
vercel env add DB_PASSWORD production
vercel env add DB_NAME production
vercel env add DB_SSL production       # nilai: true
vercel env add DB_CONN_LIMIT production # nilai: 5
vercel env add JWT_SECRET production
vercel --prod     # deploy ke production
```

---

## Bagian D — Menghubungkan Vercel ke TiDB

1. Pastikan **semua** environment variable DB di Bagian C sudah diisi (terutama `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`).
2. **Redeploy** agar environment variable baru terbaca: Dashboard → Deployments → **Redeploy** (atau `vercel --prod`).
3. Di TiDB Cloud, buka **Network Access** / IP Access List dan izinkan akses publik (`0.0.0.0/0`) untuk serverless, atau biarkan default yang mengizinkan koneksi publik dengan TLS. Vercel menggunakan IP dinamis sehingga pembatasan IP tidak praktis.
4. Uji koneksi: buka `https://<domain-vercel>/api/settings` — harus mengembalikan JSON (bukan error 500).

---

## Bagian E — Verifikasi & Troubleshooting

| Gejala | Kemungkinan sebab | Solusi |
|--------|-------------------|--------|
| `/api/*` error 500 | Env DB salah / database kosong | Cek kredensial, pastikan dump sudah diimpor (`SHOW TABLES;`) |
| `SSL/TLS required` | `DB_SSL` belum `true` | Set `DB_SSL=true` lalu redeploy |
| `Access denied` | User/password/prefix salah | Salin ulang dari halaman Connect TiDB |
| `Unknown database` | `DB_NAME` beda dengan yang dibuat | Samakan nama database |
| `Too many connections` | Connection limit terlalu besar untuk serverless | Set `DB_CONN_LIMIT=5` lalu redeploy |
| Halaman admin tidak bisa login | Password admin default | Login `admin` / `admin123`, lalu ganti di menu Pengaturan |

Setelah live, **wajib**:
- Login ke `https://<domain>/admin.html` dan ganti password admin.
- Pastikan `JWT_SECRET` diisi nilai acak yang kuat dan tidak dibagikan.

---

## Catatan
- Jangan commit file `.env` (sudah ada di `.gitignore`). Simpan kredensial hanya di Vercel Environment Variables.
- `server/index.js` tetap dipakai untuk menjalankan server lokal (`npm start`). Di Vercel, yang berjalan adalah `api/index.js`.
- Data awal: database berisi akun admin (`admin` / `admin123`), layanan, artikel, testimoni, dan galeri dari dump lokal.
