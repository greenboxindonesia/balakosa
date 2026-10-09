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

/* animasi muncul + hitung angka */
function rv() {
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

function layout(a) {
  const N = [['index', 'Beranda'], ['about', 'Tentang'], ['layanan', 'Layanan'], ['blog', 'Blog'], ['kontak', 'Kontak']];
  $('#hd').innerHTML = `<header class="hd" id="nb"><div class="hd-in"><a class="brand" href="index.html">BALAKOSA</a><nav class="hd-nav">${N.map((n) => `<a href="${n[0]}.html" class="${n[0] == a ? 'on' : ''}">${n[1]}</a>`).join('')}</nav><div class="hact"><a class="nav-cta" href="booking.html">${ICN('kalender',16)}<span>Booking</span></a><button class="hbg" id="mb" aria-label="Menu" aria-expanded="false" onclick="$('#nb').classList.toggle('open');$('#mb').classList.toggle('active');$('#mb').setAttribute('aria-expanded',$('#nb').classList.contains('open'))">${ICN('menu',22)}</button></div></div></header>`;
  $('#ft').innerHTML = `<footer><div class="w"><div class="ftop"><div class="fbr"><a class="brand" href="index.html">BALAKOSA</a><p>Hotel, penginapan, cottage, dan trip dengan pelayanan hangat dan booking semudah memilih tanggal.</p></div>
<div class="fl"><div class="fc"><h4>Menu</h4>${N.map((n) => `<a href="${n[0]}.html">${n[1]}</a>`).join('')}<a href="booking.html">Booking</a></div>
<div class="fc"><h4>Kontak</h4><p>${esc(SET.contact_address || 'Tulungagung, Jawa Timur')}</p><p>${esc(SET.contact_phone || '')}</p><p>${esc(SET.contact_email || '')}</p></div>
</div></div>
<div class="fb"><span>© ${new Date().getFullYear()} BALAKOSA. All rights reserved.</span><span>Made for a better stay.</span></div></div></footer>
<a class="fab" href="https://wa.me/${WA}" aria-label="WhatsApp">${ICN('wa',24)}</a><a class="fab top2" id="up" href="#" aria-label="Ke atas" onclick="scrollTo({top:0,behavior:'smooth'});return false">${ICN('panahAtas',20)}</a>`;
  onscroll = () => { $('#up').classList.toggle('on', scrollY > 600); $('#nb').classList.toggle('solid', scrollY > 24); };
  $('#nb').classList.toggle('solid', scrollY > 24);
}
