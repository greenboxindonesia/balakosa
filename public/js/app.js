/* BALAKOSA — frontend dinamis.
   Semua konten (layanan, artikel, testimoni, galeri, pengaturan)
   diambil dari API Node.js: GET /api/services · /api/posts · /api/testimonials · /api/gallery · /api/settings */
const API = ''; // same origin — di-serve oleh server Express
const $ = (s) => document.querySelector(s);
const rp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
const im = (i, w = 900, a = '') => `<img src="https://images.unsplash.com/photo-${i}?auto=format&fit=crop&w=${w}&q=70" alt="${a}" loading="lazy" onerror="this.remove()">`;
const img = (i, a, w) => `<div class="ph">${im(i, w, a)}</div>`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');

/* Data global — diisi oleh load() */
let SV = [], PO = [], TM = [], GL = [], SET = {}, WA = '6281234567890';

const get = async (k) => { try { const r = await fetch(API + '/api/' + k); if (!r.ok) throw 0; return await r.json(); } catch (e) { return null; } };

const load = async () => {
  const [sv, po, tm, gl, st] = await Promise.all([get('services'), get('posts'), get('testimonials'), get('gallery'), get('settings')]);
  SV = (sv || []).map((s) => ({ ...s, id: s.slug }));
  PO = po || [];
  TM = tm || [];
  GL = gl || [];
  SET = st || {};
  if (SET.wa_number) WA = SET.wa_number;
  setTimeout(rv, 60);
};

const svCard = (s) => `<a class="sc2" href="layanan.html">${img(s.image, s.name, 700)}<div class="cap"><small>per ${s.unit}</small><h3>${esc(s.name)}</h3><p>Mulai ${rp(s.price)}</p></div></a>`;
const pcCard = (s) => `<article class="pc"><a href="layanan.html">${img(s.image, s.name, 700)}</a><div class="pb"><span class="eyebrow">Per ${s.unit}</span><h3>${esc(s.name)}</h3><small>${(s.features || []).map(esc).join(' • ')}</small><div class="pp">${rp(s.price)}</div><a class="btn" href="booking.html?svc=${s.slug}">Booking ${esc(s.name)}</a></div></article>`;
const cIk = (id) => ICN(({ hotel: 'hotel', penginapan: 'hotel', cottage: 'hotel', trip: 'globe', Akomodasi: 'hotel', Trip: 'globe', Wisata: 'globe' }[id] || 'hotel'), 16);
const poCard = (p) => `<a class="po" href="blog.html?p=${p.slug}">${img(p.image, p.title, 700)}<span class="eyebrow">${esc(p.category)} · ${p.date}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></a>`;

/* isi semua placeholder [data-ic] dengan ikon SVG flat */
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-ic]:not([data-filled])').forEach((e) => {
    e.innerHTML = ICN(e.dataset.ic, e.classList.contains('hic') ? 20 : 26);
    e.dataset.filled = '1';
  });
}

/* animasi muncul + hitung angka */
function rv() {
  hydrateIcons();
  document.querySelectorAll('.card,.po,.sc2,.stat,.row2,.pc,.tm,.sn,.gal .ph,.cmp,.promo').forEach((e) => e.classList.add('rv'));
  const o = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const t = e.target; t.classList.add('in'); o.unobserve(t);
    const c = t.querySelector('[data-n]');
    if (c) {
      const n = +c.dataset.n, d = String(n).includes('.') ? 1 : 0, s = c.dataset.s || '', t0 = performance.now();
      const f = (x) => { const p = Math.min(1, (x - t0) / 1400); c.textContent = (n * p).toFixed(d) + s; if (p < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }
  }), { threshold: .15 });
  document.querySelectorAll('.rv:not(.in)').forEach((e) => o.observe(e));
}

/* Footer template — dipakai di semua halaman lewat layout().
   Memakai class unik (ft-*) agar tidak bentrok dengan style halaman lain. */
function footerTemplate() {
  return `<footer><div class="w"><div class="ftop">
<div class="fbr"><a class="brand" href="index.html"><img class="brand-logo" src="images/logo.png" alt="" width="34" height="34">BALAKOSA</a><p>Hotel, penginapan, cottage, dan trip dengan pelayanan hangat dan booking semudah memilih tanggal.</p>
<div class="trust"><span>${ICN('shield',18)} Koneksi terenkripsi</span><span>${ICN('verifikasi',18)} Penyelenggara terverifikasi</span><span>${ICN('refund',18)} Refund transparan</span></div></div>
<div class="fl">
<div class="fc"><h4>Jelajah</h4><a href="layanan.html">Hotel</a><a href="layanan.html">Penginapan</a><a href="layanan.html">Cottage</a><a href="layanan.html">Trip &amp; Wisata</a><a href="blog.html">Jurnal</a></div>
<div class="fc"><h4>Dukungan</h4><a href="faq.html">Pusat Bantuan</a><a href="booking.html">Cara Booking</a><a href="syarat.html">Syarat &amp; Ketentuan</a><a href="privasi.html">Kebijakan Privasi</a><a href="kontak.html">Hubungi Kami</a></div>
<div class="fc"><h4>Perusahaan</h4><a href="about.html">Tentang Kami</a><a href="kontak.html">Kerja Sama</a><a href="blog.html">Blog</a><a href="layanan.html">Layanan</a><a href="booking.html">Booking</a></div>
<div class="fc"><h4>Kontak</h4><p>${esc(SET.contact_address || 'Tulungagung, Jawa Timur')}</p><p>${esc(SET.contact_phone || '')}</p><p>${esc(SET.contact_email || '')}</p><p>${esc(SET.open_hours || '')}</p></div>
</div></div>
<div class="fb"><span>© ${new Date().getFullYear()} BALAKOSA — Node.js + Express + MySQL. All rights reserved.</span>
<div class="ft-pay"><span>${ICN('qris',15)} QRIS</span><span>${ICN('bank',15)} Virtual Account</span><span>${ICN('dompet',15)} E-Wallet</span><span>${ICN('kartu',15)} Transfer Bank</span></div>
</div></div></footer>
<a class="fab" href="https://wa.me/${WA}" aria-label="WhatsApp">${ICN('wa',24)}</a><a class="fab top2" id="up" href="#" aria-label="Ke atas">${ICN('panahAtas',20)}</a>`;
}

function layout(a) {
  const N = [['index', 'Beranda', 'rumah'], ['about', 'Tentang', 'info'], ['layanan', 'Layanan', 'hotel'], ['blog', 'Blog', 'buku'], ['kontak', 'Kontak', 'chat']];
  $('#hd').innerHTML = `<header class="hd" id="nb"><div class="hd-in"><a class="brand" href="index.html"><img class="brand-logo" src="images/logo-white.png" alt="" width="34" height="34">BALAKOSA</a><nav class="hd-nav">${N.map((n) => `<a href="${n[0]}.html" class="${n[0] == a ? 'on' : ''}"><span class="nav-ic">${ICN(n[2],18)}</span><span class="nav-lb">${n[1]}</span><span class="nav-chev">${ICN('panahKanan',16)}</span></a>`).join('')}</nav><div class="hact"><a class="nav-cta" href="booking.html">${ICN('kalender',16)}<span>Booking</span></a><button class="hbg" id="mb" aria-label="Menu" aria-expanded="false" onclick="$('#nb').classList.toggle('open');$('#mb').classList.toggle('active');$('#mb').setAttribute('aria-expanded',$('#nb').classList.contains('open'))">${ICN('menu',22)}</button></div></div></header>`;
  $('#ft').innerHTML = footerTemplate();
  $('#up').onclick = (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  onscroll = () => { $('#up').classList.toggle('on', scrollY > 600); $('#nb').classList.toggle('solid', scrollY > 24); };
  $('#nb').classList.toggle('solid', scrollY > 24);
}
