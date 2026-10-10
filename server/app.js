import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { q } from './db.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const JWT_SECRET = process.env.JWT_SECRET || 'balakosa_dev_secret';
const api = express.Router();

/* ---------------- helpers ---------------- */
const rp = (n) => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const iso = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const fmt = (k) => new Date(k + 'T00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const normPhone = (v) => {
  const d = String(v || '').replace(/\D/g, '');
  return d.startsWith('0') ? '62' + d.slice(1) : d;
};
const addDays = (k, n) => {
  const d = new Date(k + 'T00:00');
  d.setDate(d.getDate() + n);
  return iso(d);
};
async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Belum login' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesi berakhir, silakan login ulang' });
  }
}

const feats = (f) => typeof f === 'string' ? JSON.parse(f || '[]') : (f || []);

/* ---------------- public: services ---------------- */
api.get('/services', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order, id');
    res.json(rows.map((s) => ({ ...s, features: feats(s.features) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.get('/posts', async (req, res) => {
  try {
    const { category } = req.query;
    const rows = category && category !== 'Semua'
      ? await q('SELECT id,slug,title,category,excerpt,image,read_minutes,DATE(published_at) pdate FROM posts WHERE is_published=1 AND category=? ORDER BY published_at DESC', [category])
      : await q('SELECT id,slug,title,category,excerpt,image,read_minutes,DATE(published_at) pdate FROM posts WHERE is_published=1 ORDER BY published_at DESC');
    res.json(rows.map((p) => ({ ...p, date: new Date(p.pdate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.get('/posts/:slug', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM posts WHERE slug=? AND is_published=1', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    const p = rows[0];
    res.json({ ...p, date: new Date(p.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.get('/testimonials', async (req, res) => {
  try {
    res.json(await q('SELECT id,name,role,rating,content FROM testimonials WHERE is_active=1 ORDER BY id'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.get('/gallery', async (req, res) => {
  try {
    res.json(await q('SELECT id,image,caption FROM gallery ORDER BY sort_order, id'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.get('/settings', async (req, res) => {
  try {
    const rows = await q('SELECT setting_key, setting_value FROM settings');
    res.json(Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- public: availability & booking ---------------- */
api.get('/availability', async (req, res) => {
  try {
    const { service, month } = req.query; // month = YYYY-MM
    const svc = await q('SELECT id FROM services WHERE slug=?', [service]);
    if (!svc.length) return res.status(404).json({ error: 'Layanan tidak ditemukan' });
    const [y, m] = month.split('-').map(Number);
    const first = `${month}-01`;
    const last = iso(new Date(y, m, 0));
    const rows = await q(
      `SELECT checkin, checkout FROM bookings
       WHERE service_id=? AND status <> 'Batal' AND checkin <= ? AND checkout >= ?`,
      [svc[0].id, last, first]
    );
    const booked = new Set();
    for (const b of rows) {
      let d = b.checkin instanceof Date ? iso(b.checkin) : String(b.checkin).slice(0, 10);
      const out = b.checkout instanceof Date ? iso(b.checkout) : String(b.checkout).slice(0, 10);
      for (let k = d; k < out; k = addDays(k, 1)) booked.add(k);
    }
    res.json({ booked: [...booked] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.post('/bookings', async (req, res) => {
  try {
    const { service, name, phone, guests, checkin, checkout, payment_method, notes } = req.body;
    if (!service || !name || !phone || !checkin) return res.status(400).json({ error: 'Data tidak lengkap' });
    const tel = normPhone(phone);
    if (tel.length < 9) return res.status(400).json({ error: 'Nomor WhatsApp tidak valid' });

    const svcs = await q('SELECT * FROM services WHERE slug=? AND is_active=1', [service]);
    if (!svcs.length) return res.status(404).json({ error: 'Layanan tidak ditemukan' });
    const s = svcs[0];
    const isTrip = s.unit === 'orang';
    const out = isTrip ? checkin : (checkout || checkin);
    if (!isTrip && out <= checkin) return res.status(400).json({ error: 'Tanggal check-out harus setelah check-in' });

    // overlap check
    const clash = await q(
      `SELECT id FROM bookings WHERE service_id=? AND status<>'Batal' AND checkin < ? AND checkout > ? LIMIT 1`,
      [s.id, out, checkin]
    );
    if (clash.length) return res.status(409).json({ error: 'Tanggal tersebut sudah terisi untuk layanan ini. Coba tanggal lain.' });

    const n = isTrip ? 1 : Math.round((new Date(out + 'T00:00') - new Date(checkin + 'T00:00')) / 864e5);
    const total = s.price * (isTrip ? Math.max(1, +guests || 1) : n);
    const dp = +(await q("SELECT setting_value FROM settings WHERE setting_key='dp_percent'"))[0]?.setting_value || 30;
    const due = payment_method === 'dp' ? Math.round(total * dp / 100) : payment_method === 'lokasi' ? 0 : total;

    let code;
    do { code = 'BLK-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10); } while ((await q('SELECT id FROM bookings WHERE code=?', [code])).length);

    await q(
      `INSERT INTO bookings (code, service_id, guest_name, guest_phone, guests, checkin, checkout, payment_method, total, status, notes)
       VALUES (?,?,?,?,?,?,?,?,?, 'Menunggu', ?)`,
      [code, s.id, name.trim(), tel, Math.max(1, +guests || 1), checkin, out, payment_method || 'dp', total, notes || null]
    );
    res.json({
      ok: true, code, total, due, nights: n,
      serviceName: s.name, checkin, checkout: out,
      message: isTrip ? `Trip pada ${fmt(checkin)}` : `${fmt(checkin)} → ${fmt(out)} (${n} malam)`,
      priceLabel: `${rp(total)} (${payment_method === 'dp' ? 'DP ' + dp + '% = ' + rp(due) : payment_method === 'lokasi' ? 'bayar di lokasi' : 'lunas'})`,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Nama dan pesan wajib diisi' });
    await q('INSERT INTO contacts (name, email, message) VALUES (?,?,?)', [name.trim(), (email || '').trim(), message.trim()]);
    res.json({ ok: true, message: 'Pesan terkirim. Kami akan membalas segera.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- auth ---------------- */
api.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const rows = await q('SELECT * FROM admin_users WHERE username=?', [username || '']);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password || '', u.password_hash))) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    await q('UPDATE admin_users SET last_login=NOW() WHERE id=?', [u.id]);
    const token = jwt.sign({ id: u.id, username: u.username, name: u.name }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, admin: { username: u.username, name: u.name } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.get('/auth/me', auth, (req, res) => res.json({ admin: { username: req.admin.username, name: req.admin.name } }));

/* ---------------- admin: overview ---------------- */
api.get('/admin/overview', auth, async (req, res) => {
  try {
    const cnt = async (sql, params = []) => +(await q(sql, params))[0].n;
    const rev = await q("SELECT COALESCE(SUM(total),0) t FROM bookings WHERE status='Lunas'");
    const byService = await q(
      `SELECT s.name, s.icon, COUNT(b.id) n FROM services s LEFT JOIN bookings b ON b.service_id=s.id GROUP BY s.id ORDER BY s.sort_order`
    );
    const monthly = await q(
      `SELECT DATE_FORMAT(created_at,'%Y-%m') ym, COUNT(*) n, COALESCE(SUM(total),0) rev
       FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY ym ORDER BY ym`
    );
    const recent = await q(
      `SELECT b.id, b.code, b.guest_name, b.guest_phone, b.checkin, b.checkout, b.total, b.status, s.name service_name, s.icon
       FROM bookings b JOIN services s ON s.id=b.service_id ORDER BY b.created_at DESC LIMIT 6`
    );
    const unread = await cnt('SELECT COUNT(*) n FROM contacts WHERE is_read=0');
    const upcoming = await q(
      `SELECT b.code, b.guest_name, b.checkin, b.checkout, b.status, s.name service_name, s.icon
       FROM bookings b JOIN services s ON s.id=b.service_id
       WHERE b.status<>'Batal' AND b.checkout >= CURDATE() ORDER BY b.checkin ASC LIMIT 8`
    );
    res.json({
      totalBookings: await cnt('SELECT COUNT(*) n FROM bookings'),
      waiting: await cnt("SELECT COUNT(*) n FROM bookings WHERE status='Menunggu'"),
      confirmed: await cnt("SELECT COUNT(*) n FROM bookings WHERE status='Dikonfirmasi'"),
      revenue: rev[0].t,
      byService, monthly, recent, upcoming, unread,
      posts: await cnt('SELECT COUNT(*) n FROM posts'),
      contacts: await cnt('SELECT COUNT(*) n FROM contacts'),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- admin: bookings ---------------- */
api.get('/admin/bookings', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `SELECT b.*, s.name service_name, s.icon, s.unit FROM bookings b JOIN services s ON s.id=b.service_id`;
    const cond = [], params = [];
    if (status && status !== 'Semua') { cond.push('b.status=?'); params.push(status); }
    if (search) { cond.push('(b.code LIKE ? OR b.guest_name LIKE ? OR b.guest_phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (cond.length) sql += ' WHERE ' + cond.join(' AND ');
    sql += ' ORDER BY b.created_at DESC LIMIT 500';
    res.json(await q(sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.put('/admin/bookings/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Menunggu', 'Dikonfirmasi', 'Lunas', 'Batal'].includes(status)) return res.status(400).json({ error: 'Status tidak valid' });
    await q('UPDATE bookings SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.delete('/admin/bookings/:id', auth, async (req, res) => {
  try {
    await q('DELETE FROM bookings WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- admin: services ---------------- */
api.get('/admin/services', auth, async (req, res) => {
  try { res.json(await q('SELECT * FROM services ORDER BY sort_order, id').then((r) => r.map((s) => ({ ...s, features: feats(s.features) })))); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

api.post('/admin/services', auth, async (req, res) => {
  try {
    const b = req.body;
    await q(
      `INSERT INTO services (slug, name, category, icon, tagline, description, features, rules, price, unit, image, is_active, sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), icon=VALUES(icon), tagline=VALUES(tagline),
        description=VALUES(description), features=VALUES(features), rules=VALUES(rules), price=VALUES(price),
        unit=VALUES(unit), image=VALUES(image), is_active=VALUES(is_active), sort_order=VALUES(sort_order)`,
      [b.slug, b.name, b.category || 'Akomodasi', b.icon || '🏨', b.tagline || '', b.description || '', JSON.stringify(b.features || []), b.rules || '', +b.price || 0, b.unit || 'malam', b.image || '1566073771259-6a8506099945', b.is_active ?? 1, +b.sort_order || 0]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.put('/admin/services/:id', auth, async (req, res) => {
  try {
    const b = req.body;
    await q(
      `UPDATE services SET name=?, category=?, icon=?, tagline=?, description=?, features=?, rules=?, price=?, unit=?, image=?, is_active=?, sort_order=? WHERE id=?`,
      [b.name, b.category || 'Akomodasi', b.icon || '🏨', b.tagline || '', b.description || '', JSON.stringify(b.features || []), b.rules || '', +b.price || 0, b.unit || 'malam', b.image || '', b.is_active ?? 1, +b.sort_order || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.delete('/admin/services/:id', auth, async (req, res) => {
  try { await q('DELETE FROM services WHERE id=?', [req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- admin: posts ---------------- */
api.get('/admin/posts', auth, async (req, res) => {
  try { res.json(await q('SELECT id,slug,title,category,excerpt,image,read_minutes,is_published,published_at FROM posts ORDER BY published_at DESC')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

api.post('/admin/posts', auth, async (req, res) => {
  try {
    const b = req.body;
    const slug = (b.slug || b.title || 'artikel').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await q(
      `INSERT INTO posts (slug, title, category, excerpt, content, image, read_minutes, is_published) VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), excerpt=VALUES(excerpt), content=VALUES(content), image=VALUES(image), read_minutes=VALUES(read_minutes), is_published=VALUES(is_published)`,
      [slug, b.title, b.category || 'Tips', b.excerpt || '', b.content || '', b.image || '1537996194471-e657df975ab4', +b.read_minutes || 5, b.is_published ?? 1]
    );
    res.json({ ok: true, slug });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.put('/admin/posts/:id', auth, async (req, res) => {
  try {
    const b = req.body;
    await q(
      `UPDATE posts SET title=?, category=?, excerpt=?, content=?, image=?, read_minutes=?, is_published=? WHERE id=?`,
      [b.title, b.category || 'Tips', b.excerpt || '', b.content || '', b.image || '', +b.read_minutes || 5, b.is_published ?? 1, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.delete('/admin/posts/:id', auth, async (req, res) => {
  try { await q('DELETE FROM posts WHERE id=?', [req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- admin: contacts & testimonials ---------------- */
api.get('/admin/contacts', auth, async (req, res) => {
  try { res.json(await q('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 300')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

api.put('/admin/contacts/:id', auth, async (req, res) => {
  try { await q('UPDATE contacts SET is_read=? WHERE id=?', [req.body.is_read ?? 1, req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

api.delete('/admin/contacts/:id', auth, async (req, res) => {
  try { await q('DELETE FROM contacts WHERE id=?', [req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

api.get('/admin/testimonials', auth, async (req, res) => {
  try { res.json(await q('SELECT * FROM testimonials ORDER BY id')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

api.put('/admin/testimonials/:id', auth, async (req, res) => {
  try {
    const b = req.body;
    await q('UPDATE testimonials SET name=?, role=?, rating=?, content=?, is_active=? WHERE id=?',
      [b.name, b.role || 'Tamu', +b.rating || 5, b.content, b.is_active ?? 1, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.post('/admin/testimonials', auth, async (req, res) => {
  try {
    const b = req.body;
    await q('INSERT INTO testimonials (name, role, rating, content, is_active) VALUES (?,?,?,?,?)',
      [b.name, b.role || 'Tamu', +b.rating || 5, b.content, b.is_active ?? 1]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.delete('/admin/testimonials/:id', auth, async (req, res) => {
  try { await q('DELETE FROM testimonials WHERE id=?', [req.params.id]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- admin: settings ---------------- */
api.put('/admin/settings', auth, async (req, res) => {
  try {
    for (const [k, v] of Object.entries(req.body || {})) {
      await q('INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)', [k, String(v ?? '')]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

api.post('/admin/password', auth, async (req, res) => {
  try {
    const { current, next } = req.body;
    const u = (await q('SELECT * FROM admin_users WHERE id=?', [req.admin.id]))[0];
    if (!u || !(await bcrypt.compare(current || '', u.password_hash))) return res.status(401).json({ error: 'Password lama salah' });
    if (!next || next.length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    await q('UPDATE admin_users SET password_hash=? WHERE id=?', [await bcrypt.hash(next, 10), u.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use('/api', api);

// SPA fallback: arahkan rute tak dikenal ke beranda
app.use((req, res) => res.redirect('/'));

export default app;
