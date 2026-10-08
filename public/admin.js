/* BALAKOSA Admin Dashboard */
const $=s=>document.querySelector(s);
const API='';
let TOKEN=localStorage.getItem('blk_token')||'';
let ADMIN=JSON.parse(localStorage.getItem('blk_admin')||'null');
const rp=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const fd=k=>k?new Date(String(k).slice(0,10)+'T00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'—';
const fdt=k=>k?new Date(k).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2400)}

async function req(path,opts={}){
  const r=await fetch(API+'/api'+path,{...opts,headers:{'Content-Type':'application/json',...(TOKEN?{Authorization:'Bearer '+TOKEN}:{}),...opts.headers}});
  if(r.status===401){showLogin();throw new Error('Sesi berakhir')}
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||'Terjadi kesalahan');
  return d;
}

/* ============ auth ============ */
function showLogin(){$('#login').style.display='grid';$('#shell').classList.remove('on');TOKEN='';localStorage.removeItem('blk_token');localStorage.removeItem('blk_admin')}
function showShell(){if(!TOKEN)return showLogin();$('#login').style.display='none';$('#shell').classList.add('on');if(ADMIN){$('#whoName').textContent=ADMIN.name||ADMIN.username;$('#avatar').textContent=(ADMIN.name||ADMIN.username||'A').slice(0,1).toUpperCase()}go(location.hash.replace('#','')||'dash')}
async function login(){
  const b=$('#lbtn');b.disabled=true;b.textContent='Memeriksa…';$('#lerr').classList.remove('on');
  try{
    const d=await req('/auth/login',{method:'POST',body:JSON.stringify({username:$('#lu').value.trim(),password:$('#lp').value})});
    TOKEN=d.token;ADMIN=d.admin;localStorage.setItem('blk_token',TOKEN);localStorage.setItem('blk_admin',JSON.stringify(d.admin));
    showShell();toast('Selamat datang, '+(d.admin.name||d.admin.username)+' 👋');
  }catch(e){$('#lerr').textContent=e.message;$('#lerr').classList.add('on')}
  b.disabled=false;b.textContent='Masuk Dashboard';
}
function logout(){showLogin()}

/* ============ router ============ */
const TITLES={dash:'Dashboard',bookings:'Kelola Booking',services:'Kelola Layanan',posts:'Kelola Artikel',contacts:'Pesan Masuk',testimonials:'Testimoni Tamu',settings:'Pengaturan'};
function go(t){
  if(!TITLES[t])t='dash';
  document.querySelectorAll('.side a[data-t]').forEach(a=>a.classList.toggle('on',a.dataset.t===t));
  $('#mtitle').textContent=TITLES[t];
  $('#side').classList.remove('open');
  ({dash:vDash,bookings:vBookings,services:vServices,posts:vPosts,contacts:vContacts,testimonials:vTesti,settings:vSettings}[t])().catch(e=>toast(e.message));
}
addEventListener('hashchange',()=>go(location.hash.replace('#','')));

/* ============ dashboard ============ */
async function vDash(){
  const o=await req('/admin/overview');
  $('#nwait').style.display=o.waiting?'inline-block':'none';$('#nwait').textContent=o.waiting;
  $('#nunread').style.display=o.unread?'inline-block':'none';$('#nunread').textContent=o.unread;
  const mx=Math.max(1,...o.byService.map(s=>s.n));
  const rev6=o.monthly.reduce((a,b)=>a+Number(b.rev),0),bk6=o.monthly.reduce((a,b)=>a+Number(b.n),0);
  $('#view').innerHTML=`
  <div class="g4">
    <div class="card kpi"><small>Total Booking</small><b>${o.totalBookings}</b><span class="mut" style="font-size:.76rem">${bk6} dalam 6 bulan terakhir</span></div>
    <div class="card kpi"><small>Menunggu Konfirmasi</small><b style="color:var(--warn)">${o.waiting}</b><span class="mut" style="font-size:.76rem">perlu ditindaklanjuti</span></div>
    <div class="card kpi"><small>Dikonfirmasi</small><b>${o.confirmed}</b><span class="mut" style="font-size:.76rem">tanggal terkunci</span></div>
    <div class="card kpi acc"><small>Pendapatan (Lunas)</small><b>${rp(o.revenue)}</b><span class="mut" style="font-size:.76rem">${rp(rev6)} dari 6 bulan terakhir</span></div>
  </div>
  <div class="g2" style="margin-top:18px">
    <div class="card"><h3>Booking per Layanan</h3>${o.byService.map(s=>`<div class="bar"><span>${s.icon} ${esc(s.name)}</span><div><i style="width:${s.n/mx*100}%"></i></div><b>${s.n}</b></div>`).join('')}</div>
    <div class="card"><h3>Jadwal Mendatang</h3>${o.upcoming.length?o.upcoming.map(b=>`<div class="bar" style="grid-template-columns:1fr auto"><span>${b.icon} ${esc(b.service_name)} · <b style="font-family:'Plus Jakarta Sans';font-weight:600">${esc(b.guest_name)}</b><br><small class="mut">${fd(b.checkin)}${b.checkout&&b.checkout!==b.checkin?' → '+fd(b.checkout):''}</small></span><span class="tag ${{'Menunggu':'y','Dikonfirmasi':'','Lunas':'g','Batal':'r'}[b.status]||''}">${b.status}</span></div>`).join(''):'<p class="empty">Tidak ada jadwal mendatang.</p>'}</div>
  </div>
  <div class="card" style="margin-top:18px"><h3>Booking Terbaru</h3>${o.recent.length?`<div class="tw"><table><tr><th>ID</th><th>Tamu</th><th>Layanan</th><th>Tanggal</th><th>Total</th><th>Status</th></tr>${o.recent.map(b=>`<tr><td><b>${esc(b.code)}</b></td><td>${esc(b.guest_name)}<br><small class="mut">${esc(b.guest_phone)}</small></td><td>${b.icon} ${esc(b.service_name)}</td><td>${fd(b.checkin)}${b.checkout&&b.checkout!==b.checkin?' → '+fd(b.checkout):''}</td><td>${rp(b.total)}</td><td><span class="tag ${{'Menunggu':'y','Dikonfirmasi':'','Lunas':'g','Batal':'r'}[b.status]||''}">${b.status}</span></td></tr>`).join('')}</table></div>`:'<p class="empty">Belum ada booking.</p>'}</div>`;
}

/* ============ bookings ============ */
let bkFilter='Semua',bkSearch='';
async function vBookings(){
  $('#view').innerHTML=`<div class="card"><div class="tools">
    <select id="fst">${['Semua','Menunggu','Dikonfirmasi','Lunas','Batal'].map(x=>`<option${x===bkFilter?' selected':''}>${x}</option>`).join('')}</select>
    <input id="fse" placeholder="Cari ID / nama / WA…" value="${esc(bkSearch)}">
    <button class="btn sm gh" onclick="loadBk()">Terapkan</button></div>
  <div id="bklist" class="tw"><p class="empty">Memuat…</p></div></div>`;
  $('#fse').addEventListener('keydown',e=>{if(e.key==='Enter')loadBk()});
  loadBk();
}
async function loadBk(){
  bkFilter=$('#fst').value;bkSearch=$('#fse').value.trim();
  const rows=await req('/admin/bookings?status='+encodeURIComponent(bkFilter)+(bkSearch?'&search='+encodeURIComponent(bkSearch):''));
  $('#bklist').innerHTML=rows.length?`<table><tr><th>ID</th><th>Tamu</th><th>Layanan</th><th>Tanggal</th><th>Tamu</th><th>Bayar</th><th>Total</th><th>Status</th><th></th></tr>
  ${rows.map(b=>`<tr><td><b>${esc(b.code)}</b><br><small class="mut">${fdt(b.created_at)}</small></td>
  <td>${esc(b.guest_name)}<br><small class="mut">${esc(b.guest_phone)}</small>${b.notes?`<br><small class="mut">“${esc(b.notes)}”</small>`:''}</td>
  <td>${b.icon} ${esc(b.service_name)}</td>
  <td>${fd(b.checkin)}${b.checkout&&b.checkout!==b.checkin?'<br>→ '+fd(b.checkout):''}</td>
  <td>${b.guests}</td><td>${esc(b.payment_method)}</td><td>${rp(b.total)}</td>
  <td><select class="s-${b.status}" onchange="setStatus(${b.id},this.value)">${['Menunggu','Dikonfirmasi','Lunas','Batal'].map(x=>`<option${x===b.status?' selected':''}>${x}</option>`).join('')}</select></td>
  <td><button class="icb" title="Hapus" onclick="delBk(${b.id},'${esc(b.code)}')">🗑</button></td></tr>`).join('')}</table>`:'<p class="empty">Tidak ada booking yang cocok.</p>';
}
async function setStatus(id,status){await req('/admin/bookings/'+id,{method:'PUT',body:JSON.stringify({status})});toast('Status diperbarui → '+status);loadBk();refreshBadges()}
async function delBk(id,code){if(!confirm('Hapus booking '+code+'? Tindakan ini permanen.'))return;await req('/admin/bookings/'+id,{method:'DELETE'});toast('Booking dihapus');loadBk()}
async function refreshBadges(){try{const o=await req('/admin/overview');$('#nwait').style.display=o.waiting?'inline-block':'none';$('#nwait').textContent=o.waiting;$('#nunread').style.display=o.unread?'inline-block':'none';$('#nunread').textContent=o.unread}catch(e){}}

/* ============ services ============ */
async function vServices(){
  const rows=await req('/admin/services');
  $('#view').innerHTML=`<div class="card"><div class="tools"><button class="btn sm" onclick="svcForm()">+ Tambah Layanan</button></div>
  <div class="tw"><table><tr><th>Layanan</th><th>Kategori</th><th>Harga</th><th>Aktif</th><th>Aksi</th></tr>
  ${rows.map(s=>`<tr><td><b>${s.icon} ${esc(s.name)}</b><br><small class="mut">/${esc(s.slug)}</small></td><td>${esc(s.category)}</td><td>${rp(s.price)}/${esc(s.unit)}</td><td>${s.is_active?'<span class="tag g">Aktif</span>':'<span class="tag r">Nonaktif</span>'}</td>
  <td><button class="icb" onclick='svcForm(${JSON.stringify(s).replace(/'/g,"&#39;")})'>✏️</button> <button class="icb" onclick="delSvc(${s.id},'${esc(s.name)}')">🗑</button></td></tr>`).join('')}</table></div></div>`;
}
function svcForm(s={}){
  openModal(`<h3>${s.id?'Edit':'Tambah'} Layanan</h3>
  <div class="fg">
  <label>Nama<input id="sv_n" value="${esc(s.name||'')}"></label>
  <label>Slug (unik)<input id="sv_slug" value="${esc(s.slug||'')}" ${s.id?'disabled':''}></label>
  <label>Kategori<input id="sv_cat" value="${esc(s.category||'Akomodasi')}"></label>
  <label>Ikon (emoji)<input id="sv_icon" value="${esc(s.icon||'🏨')}"></label>
  <label>Harga (Rp)<input id="sv_price" type="number" min="0" value="${s.price||0}"></label>
  <label>Satuan<select id="sv_unit"><option${(s.unit||'malam')==='malam'?' selected':''}>malam</option><option${s.unit==='orang'?' selected':''}>orang</option></select></label>
  <label>URL/ID Foto (Unsplash id)<input id="sv_img" value="${esc(s.image||'')}"></label>
  <label>Urutan<input id="sv_sort" type="number" value="${s.sort_order||0}"></label></div>
  <label>Tagline<input id="sv_tag" value="${esc(s.tagline||'')}"></label>
  <label>Fasilitas (pisah dengan koma)<input id="sv_feat" value="${esc((s.features||[]).join(', '))}"></label>
  <label>Deskripsi<textarea id="sv_desc">${esc(s.description||'')}</textarea></label>
  <label>Ketentuan (check-in/out, dsb.)<textarea id="sv_rules" style="min-height:70px">${esc(s.rules||'')}</textarea></label>
  <label>Aktif <input type="checkbox" id="sv_act" ${s.is_active??1?'checked':''} style="width:auto;margin-left:8px"></label>
  <div class="mfoot"><button class="btn gh" onclick="closeModal()">Batal</button><button class="btn" onclick="saveSvc(${s.id||0})">Simpan</button></div>`);
}
async function saveSvc(id){
  const b={name:$('#sv_n').value.trim(),slug:$('#sv_slug').value.trim(),category:$('#sv_cat').value.trim(),icon:$('#sv_icon').value.trim()||'🏨',price:+$('#sv_price').value||0,unit:$('#sv_unit').value,image:$('#sv_img').value.trim(),sort_order:+$('#sv_sort').value||0,tagline:$('#sv_tag').value.trim(),features:$('#sv_feat').value.split(',').map(x=>x.trim()).filter(Boolean),description:$('#sv_desc').value.trim(),rules:$('#sv_rules').value.trim(),is_active:$('#sv_act').checked?1:0};
  if(!b.name)return toast('Nama wajib diisi');
  try{await req(id?'/admin/services/'+id:'/admin/services',{method:id?'PUT':'POST',body:JSON.stringify(b)});closeModal();toast('Layanan tersimpan');vServices()}catch(e){toast(e.message)}
}
async function delSvc(id,name){if(!confirm('Hapus layanan '+name+'? Booking terkait juga akan terhapus.'))return;await req('/admin/services/'+id,{method:'DELETE'});toast('Layanan dihapus');vServices()}

/* ============ posts ============ */
async function vPosts(){
  const rows=await req('/admin/posts');
  $('#view').innerHTML=`<div class="card"><div class="tools"><button class="btn sm" onclick="poForm()">+ Tambah Artikel</button></div>
  <div class="tw"><table><tr><th>Judul</th><th>Kategori</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr>
  ${rows.map(p=>`<tr><td><b>${esc(p.title)}</b><br><small class="mut">/${esc(p.slug)}</small></td><td><span class="tag">${esc(p.category)}</span></td><td>${p.is_published?'<span class="tag g">Terbit</span>':'<span class="tag y">Draf</span>'}</td><td>${fd(p.published_at)}</td>
  <td><button class="icb" onclick='poForm(${JSON.stringify(p).replace(/'/g,"&#39;")})'>✏️</button> <button class="icb" onclick="delPo(${p.id})">🗑</button> <a class="icb" title="Lihat" href="blog.html?p=${esc(p.slug)}" target="_blank">🔗</a></td></tr>`).join('')}</table></div></div>`;
}
function poForm(p={}){
  openModal(`<h3>${p.id?'Edit':'Tambah'} Artikel</h3>
  <div class="fg">
  <label>Judul<input id="po_t" value="${esc(p.title||'')}"></label>
  <label>Kategori<input id="po_c" value="${esc(p.category||'Tips')}"></label>
  <label>ID Foto (Unsplash id)<input id="po_img" value="${esc(p.image||'')}"></label>
  <label>Menit baca<input id="po_m" type="number" min="1" value="${p.read_minutes||5}"></label></div>
  <label>Ringkasan<textarea id="po_ex" style="min-height:70px">${esc(p.excerpt||'')}</textarea></label>
  <label>Isi artikel (pisahkan paragraf dengan baris kosong)<textarea id="po_co" style="min-height:180px">${esc(p.content||'')}</textarea></label>
  <label>Terbitkan <input type="checkbox" id="po_pub" ${p.is_published??1?'checked':''} style="width:auto;margin-left:8px"></label>
  <div class="mfoot"><button class="btn gh" onclick="closeModal()">Batal</button><button class="btn" onclick="savePo(${p.id||0})">Simpan</button></div>`);
}
async function savePo(id){
  const b={title:$('#po_t').value.trim(),category:$('#po_c').value.trim()||'Tips',image:$('#po_img').value.trim(),read_minutes:+$('#po_m').value||5,excerpt:$('#po_ex').value.trim(),content:$('#po_co').value.trim(),is_published:$('#po_pub').checked?1:0};
  if(!b.title)return toast('Judul wajib diisi');
  try{await req(id?'/admin/posts/'+id:'/admin/posts',{method:id?'PUT':'POST',body:JSON.stringify(b)});closeModal();toast('Artikel tersimpan');vPosts()}catch(e){toast(e.message)}
}
async function delPo(id){if(!confirm('Hapus artikel ini?'))return;await req('/admin/posts/'+id,{method:'DELETE'});toast('Artikel dihapus');vPosts()}

/* ============ contacts ============ */
async function vContacts(){
  const rows=await req('/admin/contacts');
  $('#view').innerHTML=`<div class="card"><div class="tw">${rows.length?`<table><tr><th>Dari</th><th>Pesan</th><th>Status</th><th>Aksi</th></tr>
  ${rows.map(c=>`<tr><td><b>${esc(c.name)}</b>${c.email?`<br><small class="mut">${esc(c.email)}</small>`:''}<br><small class="mut">${fdt(c.created_at)}</small></td>
  <td style="max-width:420px">${esc(c.message)}</td>
  <td>${c.is_read?'<span class="tag g">Dibaca</span>':'<span class="tag y">Baru</span>'}</td>
  <td>${c.is_read?'':`<button class="icb" title="Tandai dibaca" onclick="readC(${c.id})">✓</button>`} <button class="icb" onclick="delC(${c.id})">🗑</button></td></tr>`).join('')}</table>`:'<p class="empty">Belum ada pesan masuk.</p>'}</div></div>`;
}
async function readC(id){await req('/admin/contacts/'+id,{method:'PUT',body:JSON.stringify({is_read:1})});toast('Ditandai dibaca');vContacts();refreshBadges()}
async function delC(id){if(!confirm('Hapus pesan ini?'))return;await req('/admin/contacts/'+id,{method:'DELETE'});toast('Pesan dihapus');vContacts()}

/* ============ testimonials ============ */
async function vTesti(){
  const rows=await req('/admin/testimonials');
  $('#view').innerHTML=`<div class="card"><div class="tools"><button class="btn sm" onclick="tmForm()">+ Tambah Testimoni</button></div>
  <div class="tw"><table><tr><th>Nama</th><th>Peran</th><th>Rating</th><th>Isi</th><th>Status</th><th>Aksi</th></tr>
  ${rows.map(t=>`<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.role)}</td><td>${'★'.repeat(t.rating)}</td><td style="max-width:360px">${esc(t.content)}</td><td>${t.is_active?'<span class="tag g">Tampil</span>':'<span class="tag r">Sembunyi</span>'}</td>
  <td><button class="icb" onclick='tmForm(${JSON.stringify(t).replace(/'/g,"&#39;")})'>✏️</button> <button class="icb" onclick="delTm(${t.id})">🗑</button></td></tr>`).join('')}</table></div></div>`;
}
function tmForm(t={}){
  openModal(`<h3>${t.id?'Edit':'Tambah'} Testimoni</h3>
  <div class="fg"><label>Nama<input id="tm_n" value="${esc(t.name||'')}"></label>
  <label>Peran<input id="tm_r" value="${esc(t.role||'Tamu')}"></label>
  <label>Rating<select id="tm_s">${[5,4,3,2,1].map(n=>`<option${(t.rating||5)===n?' selected':''}>${n}</option>`).join('')}</select></label>
  <label>Tampilkan <input type="checkbox" id="tm_a" ${t.is_active??1?'checked':''} style="width:auto;margin-left:8px"></label></div>
  <label>Isi testimoni<textarea id="tm_c">${esc(t.content||'')}</textarea></label>
  <div class="mfoot"><button class="btn gh" onclick="closeModal()">Batal</button><button class="btn" onclick="saveTm(${t.id||0})">Simpan</button></div>`);
}
async function saveTm(id){
  const b={name:$('#tm_n').value.trim(),role:$('#tm_r').value.trim(),rating:+$('#tm_s').value,content:$('#tm_c').value.trim(),is_active:$('#tm_a').checked?1:0};
  if(!b.name||!b.content)return toast('Nama & isi wajib diisi');
  try{await req(id?'/admin/testimonials/'+id:'/admin/testimonials',{method:id?'PUT':'POST',body:JSON.stringify(b)});closeModal();toast('Testimoni tersimpan');vTesti()}catch(e){toast(e.message)}
}
async function delTm(id){if(!confirm('Hapus testimoni ini?'))return;await req('/admin/testimonials/'+id,{method:'DELETE'});toast('Testimoni dihapus');vTesti()}

/* ============ settings ============ */
const SETF=[['wa_number','Nomor WhatsApp admin (62…)'],['dp_percent','Persentase DP (%)'],['payment_info','Info pembayaran / rekening'],['contact_address','Alamat'],['contact_phone','Telepon'],['contact_email','Email'],['open_hours','Jam operasional'],['instagram','URL Instagram'],['site_title','Judul situs']];
async function vSettings(){
  const st=await req('/settings');
  $('#view').innerHTML=`
  <div class="card"><h3>Konten & Kontak Situs</h3>${SETF.map(f=>`<label>${f[1]}<input id="st_${f[0]}" value="${esc(st[f[0]]||'')}"></label>`).join('')}
  <div class="mfoot"><button class="btn" onclick="saveSet()">Simpan Pengaturan</button></div></div>
  <div class="card" style="margin-top:18px"><h3>Ganti Password Admin</h3>
  <div class="fg"><label>Password saat ini<input id="pw_old" type="password" autocomplete="current-password"></label>
  <label>Password baru (min. 6 karakter)<input id="pw_new" type="password" autocomplete="new-password"></label></div>
  <div class="mfoot"><button class="btn" onclick="changePw()">Ganti Password</button></div></div>`;
}
async function saveSet(){
  const b={};SETF.forEach(f=>b[f[0]]=$('#st_'+f[0]).value.trim());
  try{await req('/admin/settings',{method:'PUT',body:JSON.stringify(b)});toast('Pengaturan tersimpan')}catch(e){toast(e.message)}
}
async function changePw(){
  try{await req('/admin/password',{method:'POST',body:JSON.stringify({current:$('#pw_old').value,next:$('#pw_new').value})});toast('Password diganti ✓');$('#pw_old').value=$('#pw_new').value=''}catch(e){toast(e.message)}
}

/* ============ modal ============ */
function openModal(html){$('#mdc').innerHTML=html;$('#md').classList.add('on')}
function closeModal(){$('#md').classList.remove('on')}
$('#md').addEventListener('click',e=>{if(e.target.id==='md')closeModal()});

/* ============ boot ============ */
if(TOKEN){try{showShell()}catch(e){showLogin()}}else showLogin();
