import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { q, initSchema } from './db.js';

dotenv.config();

/* ============================================================
   Seed data BALAKOSA.
   Konten artikel bersumber dari informasi publik/terbuka tentang
   pariwisata Tulungagung (pantai selatan Jawa Timur, dst).
   Foto: Unsplash (lisensi bebas pakai).
   ============================================================ */

const services = [
  {
    slug: 'hotel',
    name: 'Hotel',
    category: 'Akomodasi',
    icon: '🏨',
    tagline: 'Kenyamanan bintang lima',
    description:
      'Kamar deluxe & suite modern dengan AC, WiFi cepat, sarapan untuk 2 orang, dan kolam renang. Resepsionis siaga 24 jam. Lokasi strategis di pusat Kota Tulungagung — kota marmer — hanya 30 menit menuju Pantai Popoh di pesisir Samudra Hindia.',
    features: JSON.stringify(['AC', 'WiFi', 'Sarapan', 'Kolam renang']),
    rules: 'Check-in 14.00 · Check-out 12.00 · Maks 3 tamu/kamar · Batal gratis H-3',
    price: 450000, unit: 'malam',
    image: '1566073771259-6a8506099945', sort_order: 1,
  },
  {
    slug: 'penginapan',
    name: 'Penginapan',
    category: 'Akomodasi',
    icon: '🛏️',
    tagline: 'Hangat seperti di rumah',
    description:
      'Homestay bersih dengan kamar mandi dalam, parkir luas, dan lokasi dekat destinasi wisata selatan Tulungagung seperti Pantai Popoh, Pantai Sine, dan Goa Lowo. Cocok untuk keluarga maupun backpacker.',
    features: JSON.stringify(['Kamar mandi dalam', 'Parkir', 'Air panas', 'WiFi']),
    rules: 'Check-in 13.00 · Check-out 11.00 · Maks 4 tamu · DP tidak dikembalikan',
    price: 250000, unit: 'malam',
    image: '1551882547-ff40c63fe5fa', sort_order: 2,
  },
  {
    slug: 'cottage',
    name: 'Cottage',
    category: 'Akomodasi',
    icon: '🏡',
    tagline: 'Privasi di tengah alam',
    description:
      'Cottage privat 2 kamar dengan dapur mini, teras berpemandangan perbukitan hijau khas selatan Tulungagung, dan area BBQ. Ideal untuk keluarga atau gathering kecil, dekat dengan rute Jalur Lintas Selatan (JLS).',
    features: JSON.stringify(['2 kamar', 'Dapur', 'Area BBQ', 'View alam']),
    rules: 'Check-in 14.00 · Check-out 11.00 · Maks 6 tamu · Deposit kerusakan Rp200.000',
    price: 750000, unit: 'malam',
    image: '1445019980597-93fa8acb246c', sort_order: 3,
  },
  {
    slug: 'trip',
    name: 'Trip',
    category: 'Tur',
    icon: '🧭',
    tagline: 'Jelajah bersama pemandu lokal',
    description:
      'Paket wisata sehari bersama pemandu lokal: transport, tiket masuk, makan siang, dan dokumentasi. Rute dapat disesuaikan — dari Pantai Popoh, naik perahu ke Goa Selo Pawon di Pantai Sine, hingga menyeberangi Waduk Wonorejo.',
    features: JSON.stringify(['Pemandu', 'Transport', 'Tiket masuk', 'Makan siang']),
    rules: 'Berangkat 07.00 · Minimal 2 peserta · Reschedule maks H-2',
    price: 350000, unit: 'orang',
    image: '1537996194471-e657df975ab4', sort_order: 4,
  },
];

const posts = [
  {
    slug: 'panduan-3-hari-tulungagung',
    title: 'Panduan 3 Hari Menjelajah Tulungagung',
    category: 'Trip',
    read_minutes: 6,
    image: '1537996194471-e657df975ab4',
    excerpt: 'Dari pantai selatan hingga wisata waduk dan budaya, ini itinerary santai 3 hari yang bisa Anda ikuti.',
    content:
      'Hari pertama, berangkatlah pagi-pagi menuju Pantai Popoh di pesisir Samudra Hindia, sekitar 30 km selatan pusat Kota Tulungagung. Nikmati suasana nelayan, kuliner sende, dan matahari terbenam yang legendaris di teluk ini. Sore hari, kembali ke kota untuk berkeliling alun-alun dan mencoba kuliner khas.\n\nHari kedua adalah hari pantai timur: Pantai Sine dengan perahunya menuju Goa Selo Pawon, lalu lanjut ke Pantai Molang dan Pantai Gemah yang lebih tenang. Rute Jalur Lintas Selatan (JLS) yang melewati perbukitan hijau membuat perjalanan di antara pantai-pantai ini sendiri sudah menjadi atraksi.\n\nHari ketua, manfaatkan untuk Waduk Wonorejo — salah satu waduk terluas di Indonesia dan Asia Tenggara. Aktivitas andalan di sini adalah paddleboard dan menyusuri danau dengan perahu. Sebelum pulang, singgahi sentra kerajinan marmer Tulungagung untuk membawa oleh-oleh batu akik dan kerajinan batu alam.\n\nTips: pesan akomodasi lebih awal, terutama pada akhir pekan dan musim liburan, karena pantai selatan Tulungagung ramai dikunjungi wisatawan domestik.',
  },
  {
    slug: 'pantai-popoh-tepi-samudra',
    title: 'Pantai Popoh: Tepi Samudra Hindia yang Tak Pernah Sepi',
    category: 'Destinasi',
    read_minutes: 5,
    image: '1520250497591-112f2f40a3f4',
    excerpt: 'Pantai tertua dan paling terkenal di Tulungagung, 30 km dari pusat kota, dengan teluk, kapal nelayan, dan sunset terbaik.',
    content:
      'Pantai Popoh adalah objek wisata pantai paling dikenal di Tulungagung. Terletak di pesisir Samudra Hindia, sekitar 30 km sebelah selatan pusat kota, teluk ini sudah lama menjadi tujuan favorit wisatawan sejak era kolonial Belanda.\n\nBerbeda dengan pantai selatan Jawa pada umumnya yang berombak besar, teluk Popoh relatif tenang. Kapal-kapal nelayan bersandar di tepian, dan aktivitas nelayan membawa serta kuliner laut segar yang dijual di sepanjang jalan pantai.\n\nAktivitas yang bisa dilakukan: memancing, berkeliling teluk dengan perahu, berkemah di area yang disediakan, dan tentu saja menikmati matahari terbenam. Harga tiket masuk terjangkau, cocok untuk liburan keluarga.\n\nAkses: dari Stasiun Tulungagung sekitar 30–40 menit dengan kendaraan roda dua atau empat, jalanan mulus dan berkelok di antara perbukitan.',
  },
  {
    slug: 'pantai-sine-goa-selo-pawon',
    title: 'Serunya Naik Perahu ke Goa Selo Pawon dari Pantai Sine',
    category: 'Destinasi',
    read_minutes: 5,
    image: '1469474968028-56623f02e42e',
    excerpt: 'Perbukitan hijau yang bertemu laut biru, goa karst kecil di tebing, dan perahu nelayan — kombinasi wisata paling hits di Tulungagung.',
    content:
      'Pantai Sine di Kecamatan Kalidawir, Tulungagung, sedang naik daun berkat Goa Selo Pawon — goa kecil di tepi tebing karst yang langsung berhadapan dengan laut. Pengunjung menyewa perahu nelayan untuk mendekati tebing dan berfoto dengan latar bukit hijau yang menyentuh birunya laut.\n\nPantai ini buka sejak pukul 05.00 hingga 19.00. Waktu terbaik berkunjung adalah pagi hari ketika kabut tipis masih menyelimuti perbukitan, atau sore hari menjelang sunset.\n\nJangan lupa siapkan kamera dengan baterai penuh: jalur perahu, tebing karst, dan panorama bukit adalah trio foto yang sulit ditolak. Sewa perahu dikenakan biaya terjangkau per rombongan dan dikenal aman karena dikelola nelayan lokal.',
  },
  {
    slug: 'waduk-wonorejo-paddleboard',
    title: 'Waduk Wonorejo: Danau Raksasa untuk Paddleboard dan Piknik',
    category: 'Destinasi',
    read_minutes: 4,
    image: '1551882547-ff40c63fe5fa',
    excerpt: 'Salah satu waduk terluas di Indonesia dan Asia Tenggara dengan garis pantai berbukit yang cocok untuk olahraga air santai.',
    content:
      'Waduk Wonorejo di Kecamatan Tanggunggunung sering disebut sebagai salah satu waduk terluas di Indonesia bahkan Asia Tenggara. Luasnya membentang seperti danau raksasa dikelilingi perbukitan hijau.\n\nBelakangan ini waduk ini populer untuk aktivitas paddleboard: airnya tenang, pemandangan 360 derajat, dan beberapa operator lokal menyewakan perlengkapan lengkap dengan instruktur untuk pemula.\n\nSelain paddleboard, tersedia perahu keliling dan spot piknik di tepian. Waduk ini juga berfungsi irigasi bagi lahan pertanian di selatan — berkunjung ke sini sekaligus belajar melihat tata kelola air yang menopang kehidupan sekitarnya.',
  },
  {
    slug: 'goa-lowu-ngetrep',
    title: 'Goa Lowo: Gua Kelelawar Terbesar di Asia Tenggara ada di Tulungagung',
    category: 'Destinasi',
    read_minutes: 4,
    image: '1542314831-068cd1dbfeeb',
    excerpt: 'Gua stalaktit-stalakmit di Ngetrep, Patukrejomustyan, dengan koloni kelelawar jutaan ekor dan legenda Putri Ayu Pikirsi Wulandari.',
    content:
      'Goa Lowo (kadang ditulis Goa Lowu) di Desa Ngetrep, Kecamatan Patukrejomustyan, adalah gua yang diklaim sebagai gua kelelawar terbesar di Asia Tenggara. Di dalamnya tersimpan stalaktit dan stalakmit raksasa serta koloni kelelawar yang jumlahnya jutaan ekor.\n\nNama "Lowo" berarti kelelawar dalam bahasa Jawa. Lokalnya melekat legenda Putri Ayu Pikirsi Wulandari yang dikutuk menjadi kelelawar. Sensasi berjalan di lorong gua yang gelap dengan suara gemuruh jutaan kelelawar membuat pengalaman ini unik dan jarang ada di tempat lain.\n\nDengan tiket murah dan pemandu lokal yang siap menemani, Goa Lowo cocok masuk itinerary setengah hari, dipadukan dengan kunjungan ke pabrik dan sentra kerajinan marmer di sekitarnya.',
  },
  {
    slug: 'tulungagung-kota-marmer',
    title: 'Tulungagung, Kota Marmer: Dari Batu Gamping Menjadi Kerajinan Kelas Dunia',
    category: 'Cerita',
    read_minutes: 4,
    image: '1566073771259-6a8506099945',
    excerpt: 'Julukan Kota Marmer tidak lepas dari kawasan karst pegunungan selatan yang melahirkan industri batu alam terbesar di Jawa Timur.',
    content:
      'Tulungagung dijuluki "Kota Marmer" karena kawasan karst di wilayah selatannya menyimpan cadangan batu gamping dan marmer yang melimpah. Industri batu alam ini telah berkembang sejak lama dan menopang ekonomi ribuan warga.\n\nKunjungi sentra kerajinan marmer di Jl. Asmoro Bangun atau kawasan Pacelan, Campurdarat, untuk melihat proses pengolahan batu dari lempengan mentah menjadi meja, vas, asbak, hingga elemen interior eksklusif. Banyak produk yang diekspor ke mancanegara.\n\nBagi wisatawan, belanja langsung di sentra kerajinan memberi harga jauh lebih bersahabat dibanding membeli di kota besar — dan Anda bisa melihat sendiri tukang batu bekerja dengan presisi tinggi.',
  },
];

const testimonials = [
  ['Anindya R.', 'Tamu Cottage', 5, 'Cottage-nya bersih dan tenang, anak-anak betah. Prosesnya mudah, tinggal pilih tanggal.'],
  ['Bagas P.', 'Tamu Hotel', 5, 'Kamar nyaman dan sarapannya enak. Konfirmasi WhatsApp-nya cepat sekali.'],
  ['Dewi L.', 'Peserta Trip', 5, 'Pemandunya ramah dan rutenya seru. Semua sudah termasuk, tidak ada biaya mendadak.'],
  ['Fajar N.', 'Tamu Penginapan', 4, 'Homestay-nya bersih, parkir luas, dan dekat ke Pantai Popoh. Worth it untuk harga segini.'],
  ['Sinta M.', 'Peserta Trip', 5, 'Trip ke Sine dan Waduk Wonorejo berkesan banget, dokumentasinya rapi. Recommended!'],
];

const gallery = [
  ['1566073771259-6a8506099945', 'Kamar & fasilitas hotel'],
  ['1445019980597-93fa8acb246c', 'Cottage di tengah alam'],
  ['1537996194471-e657df975ab4', 'Trip bersama pemandu lokal'],
  ['1469474968028-56623f02e42e', 'Panorama perbukitan selatan'],
  ['1542314831-068cd1dbfeeb', 'Suasana pesisir Samudra Hindia'],
  ['1551882547-ff40c63fe5fa', 'Homestay hangat dan bersih'],
];

const settings = {
  wa_number: '6281234567890',
  dp_percent: '30',
  payment_info: 'Bank BCA 1234567890 a.n. BALAKOSA',
  contact_address: 'Jl. Pantai Popoh No. 8, Tulungagung, Jawa Timur',
  contact_phone: '+62 812-3456-7890',
  contact_email: 'halo@balakosa.id',
  open_hours: 'Setiap hari 07.00–22.00 WIB',
  instagram: 'https://instagram.com/balakosa',
  site_title: 'BALAKOSA — Stay, Relax, Explore',
  booking_hero_image: '1520250497591-112f2f40a3f4',
};

async function main() {
  await initSchema();

  // Admin user (idempotent)
  const admin = await q('SELECT id FROM admin_users WHERE username = ?', [process.env.ADMIN_USERNAME || 'admin']);
  if (!admin.length) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await q('INSERT INTO admin_users (username, password_hash, name) VALUES (?, ?, ?)', [
      process.env.ADMIN_USERNAME || 'admin', hash, 'Admin BALAKOSA',
    ]);
    console.log('✓ Akun admin dibuat:', process.env.ADMIN_USERNAME || 'admin');
  } else {
    console.log('• Akun admin sudah ada, dilewati');
  }

  for (const s of services) {
    await q(
      `INSERT INTO services (slug, name, category, icon, tagline, description, features, rules, price, unit, image, sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), icon=VALUES(icon), tagline=VALUES(tagline),
         description=VALUES(description), features=VALUES(features), rules=VALUES(rules), price=VALUES(price),
         unit=VALUES(unit), image=VALUES(image), sort_order=VALUES(sort_order)`,
      [s.slug, s.name, s.category, s.icon, s.tagline, s.description, s.features, s.rules, s.price, s.unit, s.image, s.sort_order]
    );
  }
  console.log('✓ Layanan tersinkron:', services.length);

  for (const p of posts) {
    await q(
      `INSERT INTO posts (slug, title, category, excerpt, content, image, read_minutes)
       VALUES (?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), excerpt=VALUES(excerpt),
         content=VALUES(content), image=VALUES(image), read_minutes=VALUES(read_minutes)`,
      [p.slug, p.title, p.category, p.excerpt, p.content, p.image, p.read_minutes]
    );
  }
  console.log('✓ Artikel tersinkron:', posts.length);

  const tCount = await q('SELECT COUNT(*) AS n FROM testimonials');
  if (!tCount[0].n) {
    for (const t of testimonials) {
      await q('INSERT INTO testimonials (name, role, rating, content) VALUES (?,?,?,?)', t);
    }
    console.log('✓ Testimoni ditambahkan:', testimonials.length);
  }

  const gCount = await q('SELECT COUNT(*) AS n FROM gallery');
  if (!gCount[0].n) {
    for (let i = 0; i < gallery.length; i++) {
      await q('INSERT INTO gallery (image, caption, sort_order) VALUES (?,?,?)', [gallery[i][0], gallery[i][1], i]);
    }
    console.log('✓ Galeri ditambahkan:', gallery.length);
  }

  for (const [k, v] of Object.entries(settings)) {
    await q('INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)', [k, v]);
  }
  console.log('✓ Pengaturan tersinkron:', Object.keys(settings).length);

  console.log('Selesai seeding. 🌊');
  process.exit(0);
}

main().catch((e) => {
  console.error('Seed gagal:', e.message);
  process.exit(1);
});
