-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db_client_balakosa_2026
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.22.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(120) NOT NULL DEFAULT 'Administrator',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','$2a$10$Pzc5uJoJBg4ab4Z4pAjjk.1O7ZS6BPAz28O0kz2Vs5P2WXsBU9eLe','Admin BALAKOSA','2026-10-09 18:02:20','2026-10-08 13:14:54');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(24) NOT NULL,
  `service_id` int NOT NULL,
  `guest_name` varchar(120) NOT NULL,
  `guest_phone` varchar(24) NOT NULL,
  `guests` int NOT NULL DEFAULT '1',
  `checkin` date NOT NULL,
  `checkout` date NOT NULL,
  `payment_method` varchar(24) NOT NULL DEFAULT 'dp',
  `total` int NOT NULL DEFAULT '0',
  `status` enum('Menunggu','Dikonfirmasi','Lunas','Batal') NOT NULL DEFAULT 'Menunggu',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_service_dates` (`service_id`,`checkin`,`checkout`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_booking_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL DEFAULT '',
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `caption` varchar(160) NOT NULL DEFAULT '',
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery`
--

LOCK TABLES `gallery` WRITE;
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
INSERT INTO `gallery` VALUES (1,'1566073771259-6a8506099945','Kamar & fasilitas hotel',0),(2,'1445019980597-93fa8acb246c','Cottage di tengah alam',1),(3,'1537996194471-e657df975ab4','Trip bersama pemandu lokal',2),(4,'1469474968028-56623f02e42e','Panorama perbukitan selatan',3),(5,'1542314831-068cd1dbfeeb','Suasana pesisir Samudra Hindia',4),(6,'1551882547-ff40c63fe5fa','Homestay hangat dan bersih',5);
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(160) NOT NULL,
  `title` varchar(200) NOT NULL,
  `category` varchar(64) NOT NULL DEFAULT 'Tips',
  `excerpt` varchar(400) NOT NULL,
  `content` mediumtext NOT NULL,
  `image` varchar(255) NOT NULL,
  `read_minutes` int NOT NULL DEFAULT '5',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `published_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_cat` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'panduan-3-hari-tulungagung','Panduan 3 Hari Menjelajah Tulungagung','Trip','Dari pantai selatan hingga wisata waduk dan budaya, ini itinerary santai 3 hari yang bisa Anda ikuti.','Hari pertama, berangkatlah pagi-pagi menuju Pantai Popoh di pesisir Samudra Hindia, sekitar 30 km selatan pusat Kota Tulungagung. Nikmati suasana nelayan, kuliner sende, dan matahari terbenam yang legendaris di teluk ini. Sore hari, kembali ke kota untuk berkeliling alun-alun dan mencoba kuliner khas.\n\nHari kedua adalah hari pantai timur: Pantai Sine dengan perahunya menuju Goa Selo Pawon, lalu lanjut ke Pantai Molang dan Pantai Gemah yang lebih tenang. Rute Jalur Lintas Selatan (JLS) yang melewati perbukitan hijau membuat perjalanan di antara pantai-pantai ini sendiri sudah menjadi atraksi.\n\nHari ketua, manfaatkan untuk Waduk Wonorejo — salah satu waduk terluas di Indonesia dan Asia Tenggara. Aktivitas andalan di sini adalah paddleboard dan menyusuri danau dengan perahu. Sebelum pulang, singgahi sentra kerajinan marmer Tulungagung untuk membawa oleh-oleh batu akik dan kerajinan batu alam.\n\nTips: pesan akomodasi lebih awal, terutama pada akhir pekan dan musim liburan, karena pantai selatan Tulungagung ramai dikunjungi wisatawan domestik.','1537996194471-e657df975ab4',6,1,'2026-10-08 13:14:54','2026-10-08 13:14:54','2026-10-08 13:14:54'),(2,'pantai-popoh-tepi-samudra','Pantai Popoh: Tepi Samudra Hindia yang Tak Pernah Sepi','Destinasi','Pantai tertua dan paling terkenal di Tulungagung, 30 km dari pusat kota, dengan teluk, kapal nelayan, dan sunset terbaik.','Pantai Popoh adalah objek wisata pantai paling dikenal di Tulungagung. Terletak di pesisir Samudra Hindia, sekitar 30 km sebelah selatan pusat kota, teluk ini sudah lama menjadi tujuan favorit wisatawan sejak era kolonial Belanda.\n\nBerbeda dengan pantai selatan Jawa pada umumnya yang berombak besar, teluk Popoh relatif tenang. Kapal-kapal nelayan bersandar di tepian, dan aktivitas nelayan membawa serta kuliner laut segar yang dijual di sepanjang jalan pantai.\n\nAktivitas yang bisa dilakukan: memancing, berkeliling teluk dengan perahu, berkemah di area yang disediakan, dan tentu saja menikmati matahari terbenam. Harga tiket masuk terjangkau, cocok untuk liburan keluarga.\n\nAkses: dari Stasiun Tulungagung sekitar 30–40 menit dengan kendaraan roda dua atau empat, jalanan mulus dan berkelok di antara perbukitan.','1520250497591-112f2f40a3f4',5,1,'2026-10-08 13:14:54','2026-10-08 13:14:54','2026-10-08 13:14:54'),(3,'pantai-sine-goa-selo-pawon','Serunya Naik Perahu ke Goa Selo Pawon dari Pantai Sine','Destinasi','Perbukitan hijau yang bertemu laut biru, goa karst kecil di tebing, dan perahu nelayan — kombinasi wisata paling hits di Tulungagung.','Pantai Sine di Kecamatan Kalidawir, Tulungagung, sedang naik daun berkat Goa Selo Pawon — goa kecil di tepi tebing karst yang langsung berhadapan dengan laut. Pengunjung menyewa perahu nelayan untuk mendekati tebing dan berfoto dengan latar bukit hijau yang menyentuh birunya laut.\n\nPantai ini buka sejak pukul 05.00 hingga 19.00. Waktu terbaik berkunjung adalah pagi hari ketika kabut tipis masih menyelimuti perbukitan, atau sore hari menjelang sunset.\n\nJangan lupa siapkan kamera dengan baterai penuh: jalur perahu, tebing karst, dan panorama bukit adalah trio foto yang sulit ditolak. Sewa perahu dikenakan biaya terjangkau per rombongan dan dikenal aman karena dikelola nelayan lokal.','1469474968028-56623f02e42e',5,1,'2026-10-08 13:14:54','2026-10-08 13:14:54','2026-10-08 13:14:54'),(4,'waduk-wonorejo-paddleboard','Waduk Wonorejo: Danau Raksasa untuk Paddleboard dan Piknik','Destinasi','Salah satu waduk terluas di Indonesia dan Asia Tenggara dengan garis pantai berbukit yang cocok untuk olahraga air santai.','Waduk Wonorejo di Kecamatan Tanggunggunung sering disebut sebagai salah satu waduk terluas di Indonesia bahkan Asia Tenggara. Luasnya membentang seperti danau raksasa dikelilingi perbukitan hijau.\n\nBelakangan ini waduk ini populer untuk aktivitas paddleboard: airnya tenang, pemandangan 360 derajat, dan beberapa operator lokal menyewakan perlengkapan lengkap dengan instruktur untuk pemula.\n\nSelain paddleboard, tersedia perahu keliling dan spot piknik di tepian. Waduk ini juga berfungsi irigasi bagi lahan pertanian di selatan — berkunjung ke sini sekaligus belajar melihat tata kelola air yang menopang kehidupan sekitarnya.','1551882547-ff40c63fe5fa',4,1,'2026-10-08 13:14:54','2026-10-08 13:14:54','2026-10-08 13:14:54'),(5,'goa-lowu-ngetrep','Goa Lowo: Gua Kelelawar Terbesar di Asia Tenggara ada di Tulungagung','Destinasi','Gua stalaktit-stalakmit di Ngetrep, Patukrejomustyan, dengan koloni kelelawar jutaan ekor dan legenda Putri Ayu Pikirsi Wulandari.','Goa Lowo (kadang ditulis Goa Lowu) di Desa Ngetrep, Kecamatan Patukrejomustyan, adalah gua yang diklaim sebagai gua kelelawar terbesar di Asia Tenggara. Di dalamnya tersimpan stalaktit dan stalakmit raksasa serta koloni kelelawar yang jumlahnya jutaan ekor.\n\nNama \"Lowo\" berarti kelelawar dalam bahasa Jawa. Lokalnya melekat legenda Putri Ayu Pikirsi Wulandari yang dikutuk menjadi kelelawar. Sensasi berjalan di lorong gua yang gelap dengan suara gemuruh jutaan kelelawar membuat pengalaman ini unik dan jarang ada di tempat lain.\n\nDengan tiket murah dan pemandu lokal yang siap menemani, Goa Lowo cocok masuk itinerary setengah hari, dipadukan dengan kunjungan ke pabrik dan sentra kerajinan marmer di sekitarnya.','1542314831-068cd1dbfeeb',4,1,'2026-10-08 13:14:54','2026-10-08 13:14:54','2026-10-08 13:14:54'),(6,'tulungagung-kota-marmer','Tulungagung, Kota Marmer: Dari Batu Gamping Menjadi Kerajinan Kelas Dunia','Cerita','Julukan Kota Marmer tidak lepas dari kawasan karst pegunungan selatan yang melahirkan industri batu alam terbesar di Jawa Timur.','Tulungagung dijuluki \"Kota Marmer\" karena kawasan karst di wilayah selatannya menyimpan cadangan batu gamping dan marmer yang melimpah. Industri batu alam ini telah berkembang sejak lama dan menopang ekonomi ribuan warga.\n\nKunjungi sentra kerajinan marmer di Jl. Asmoro Bangun atau kawasan Pacelan, Campurdarat, untuk melihat proses pengolahan batu dari lempengan mentah menjadi meja, vas, asbak, hingga elemen interior eksklusif. Banyak produk yang diekspor ke mancanegara.\n\nBagi wisatawan, belanja langsung di sentra kerajinan memberi harga jauh lebih bersahabat dibanding membeli di kota besar — dan Anda bisa melihat sendiri tukang batu bekerja dengan presisi tinggi.','1566073771259-6a8506099945',4,1,'2026-10-08 13:14:54','2026-10-08 13:14:54','2026-10-08 13:14:54');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(64) NOT NULL,
  `name` varchar(120) NOT NULL,
  `category` varchar(64) NOT NULL,
  `icon` varchar(16) NOT NULL DEFAULT 0xF09F8FA8,
  `tagline` varchar(160) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `features` json NOT NULL,
  `rules` text,
  `price` int NOT NULL,
  `unit` varchar(24) NOT NULL DEFAULT 'malam',
  `image` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'hotel','Hotel','Akomodasi','🏨','Kenyamanan bintang lima','Kamar deluxe & suite modern dengan AC, WiFi cepat, sarapan untuk 2 orang, dan kolam renang. Resepsionis siaga 24 jam. Lokasi strategis di pusat Kota Tulungagung — kota marmer — hanya 30 menit menuju Pantai Popoh di pesisir Samudra Hindia.','[\"AC\", \"WiFi\", \"Sarapan\", \"Kolam renang\"]','Check-in 14.00 · Check-out 12.00 · Maks 3 tamu/kamar · Batal gratis H-3',450000,'malam','1566073771259-6a8506099945',1,1,'2026-10-08 13:14:54','2026-10-08 13:14:54'),(2,'penginapan','Penginapan','Akomodasi','🛏️','Hangat seperti di rumah','Homestay bersih dengan kamar mandi dalam, parkir luas, dan lokasi dekat destinasi wisata selatan Tulungagung seperti Pantai Popoh, Pantai Sine, dan Goa Lowo. Cocok untuk keluarga maupun backpacker.','[\"Kamar mandi dalam\", \"Parkir\", \"Air panas\", \"WiFi\"]','Check-in 13.00 · Check-out 11.00 · Maks 4 tamu · DP tidak dikembalikan',250000,'malam','1551882547-ff40c63fe5fa',1,2,'2026-10-08 13:14:54','2026-10-08 13:14:54'),(3,'cottage','Cottage','Akomodasi','🏡','Privasi di tengah alam','Cottage privat 2 kamar dengan dapur mini, teras berpemandangan perbukitan hijau khas selatan Tulungagung, dan area BBQ. Ideal untuk keluarga atau gathering kecil, dekat dengan rute Jalur Lintas Selatan (JLS).','[\"2 kamar\", \"Dapur\", \"Area BBQ\", \"View alam\"]','Check-in 14.00 · Check-out 11.00 · Maks 6 tamu · Deposit kerusakan Rp200.000',750000,'malam','1445019980597-93fa8acb246c',1,3,'2026-10-08 13:14:54','2026-10-08 13:14:54'),(4,'trip','Trip','Tur','🧭','Jelajah bersama pemandu lokal','Paket wisata sehari bersama pemandu lokal: transport, tiket masuk, makan siang, dan dokumentasi. Rute dapat disesuaikan — dari Pantai Popoh, naik perahu ke Goa Selo Pawon di Pantai Sine, hingga menyeberangi Waduk Wonorejo.','[\"Pemandu\", \"Transport\", \"Tiket masuk\", \"Makan siang\"]','Berangkat 07.00 · Minimal 2 peserta · Reschedule maks H-2',350000,'orang','1537996194471-e657df975ab4',1,4,'2026-10-08 13:14:54','2026-10-08 13:14:54');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `setting_key` varchar(64) NOT NULL,
  `setting_value` text,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('booking_hero_image','1520250497591-112f2f40a3f4'),('contact_address','Jl. Pantai Popoh No. 8, Tulungagung, Jawa Timur'),('contact_email','halo@balakosa.id'),('contact_phone','+62 812-3456-7890'),('dp_percent','30'),('instagram','https://instagram.com/balakosa'),('open_hours','Setiap hari 07.00–22.00 WIB'),('payment_info','Bank BCA 1234567890 a.n. BALAKOSA'),('site_title','BALAKOSA — Stay, Relax, Explore'),('wa_number','6281234567890');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `role` varchar(120) NOT NULL DEFAULT 'Tamu',
  `rating` tinyint NOT NULL DEFAULT '5',
  `content` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'Anindya R.','Tamu Cottage',5,'Cottage-nya bersih dan tenang, anak-anak betah. Prosesnya mudah, tinggal pilih tanggal.',1,'2026-10-08 13:14:54'),(2,'Bagas P.','Tamu Hotel',5,'Kamar nyaman dan sarapannya enak. Konfirmasi WhatsApp-nya cepat sekali.',1,'2026-10-08 13:14:54'),(3,'Dewi L.','Peserta Trip',5,'Pemandunya ramah dan rutenya seru. Semua sudah termasuk, tidak ada biaya mendadak.',1,'2026-10-08 13:14:54'),(4,'Fajar N.','Tamu Penginapan',4,'Homestay-nya bersih, parkir luas, dan dekat ke Pantai Popoh. Worth it untuk harga segini.',1,'2026-10-08 13:14:54'),(5,'Sinta M.','Peserta Trip',5,'Trip ke Sine dan Waduk Wonorejo berkesan banget, dokumentasinya rapi. Recommended!',1,'2026-10-08 13:14:54');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_client_balakosa_2026'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10  8:54:45
