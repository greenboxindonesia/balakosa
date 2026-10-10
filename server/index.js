import 'dotenv/config';
import app from './app.js';
import { initSchema } from './db.js';

const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 3710;

(async () => {
  await initSchema();
  app.listen(PORT, () => console.log(`🌊 BALAKOSA server berjalan di http://localhost:${PORT}`));
})().catch((e) => { console.error('Gagal start:', e.message); process.exit(1); });
