// ====== KONFIGURASI SUPABASE ======
// Ganti dua nilai di bawah ini dengan Project URL dan anon public key
// dari Supabase kamu (Settings > API).
const SUPABASE_URL = "https://lwimzkpbuobacbkmklmg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3aW16a3BidW9iYWNia21rbG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMTAwOTEsImV4cCI6MjEwNTY4NjA5MX0.vR9eQxg71facEN8Hu3_QZ5SG58kGDAijHlLtq8KFpMg";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== ICON SET ======
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  setdaily: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  job: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  usage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>'
};

const STATUS_CLASS = { 'Menunggu':'status-menunggu', 'Diproses':'status-diproses', 'Interview':'status-interview', 'Diterima':'status-diterima', 'Ditolak':'status-ditolak' };

// ====== ROUTES ======
const ROUTES = [
  { key: 'dashboard',      label: 'Dashboard',       title: 'Dashboard',                icon: ICONS.dashboard, view: viewDashboard,     init: initDashboard },
  { key: 'set-daily',      label: 'Set Daily',       title: 'Set Daily',                 icon: ICONS.setdaily,  view: viewSetDaily,      init: initSetDaily },
  { key: 'daily-activity', label: 'Daily Activity',  title: 'Daily Activity',            icon: ICONS.activity,  view: viewDailyActivity, init: initDailyActivity },
  { key: 'job-tracking',   label: 'Lamar Kerja',     title: 'Tracking Lamaran Kerja',     icon: ICONS.job,       view: viewJobTracking,   init: initJobTracking },
  { key: 'app-usage',      label: 'App Usage',       title: 'Tracking App',              icon: ICONS.usage,     view: viewAppUsage,      init: initAppUsage },
];

let currentUser = null;
let profileName = '';

// ====== ROUTER ======
function getRouteKey() {
  return (window.location.hash || '').replace('#/', '') || 'dashboard';
}

async function router() {
  const key = getRouteKey();

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (key === 'login') {
    if (session) { window.location.hash = '#/dashboard'; return; }
    renderLogin();
    return;
  }

  if (!session) { window.location.hash = '#/login'; return; }
  currentUser = session.user;

  if (!profileName) {
    const { data: profile } = await supabaseClient.from('profiles').select('full_name').eq('id', currentUser.id).single();
    profileName = (profile && profile.full_name) || currentUser.email;
  }

  const route = ROUTES.find(r => r.key === key) || ROUTES[0];
  document.title = route.title + ' - DaiTea';
  renderShell(route.key, route.title);
  document.getElementById('view').innerHTML = route.view();
  route.init();
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

async function doLogout() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  profileName = '';
  window.location.hash = '#/login';
}

// ====== SHELL (sidebar + bottom nav + topbar) ======
function renderShell(activeKey, title) {
  const sidebarLinks = ROUTES.map(r => `
    <a class="nav-link ${r.key === activeKey ? 'active' : ''}" href="#/${r.key}">${r.icon}<span>${r.label}</span></a>`).join('');
  const bottomLinks = ROUTES.map(r => `
    <a class="${r.key === activeKey ? 'active' : ''}" href="#/${r.key}">${r.icon}<span>${r.label.split(' ')[0]}</span></a>`).join('');

  document.getElementById('app-root').innerHTML = `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="brand">DaiTea<span>.</span></div>
        ${sidebarLinks}
        <a class="nav-link logout" href="#" onclick="doLogout(); return false;">${ICONS.logout}<span>Keluar</span></a>
      </nav>
      <main class="main">
        <div class="topbar">
          <div>
            <div class="app-title">${title}</div>
            <div class="greeting" id="greeting-text">Halo, ${profileName}</div>
          </div>
          <div id="topbar-extra"></div>
        </div>
        <div id="view"></div>
      </main>
      <nav class="bottom-nav">${bottomLinks}</nav>
    </div>`;
}

// ====== HELPERS ======
function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function formatTanggalIndo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// =====================================================================
// LOGIN
// =====================================================================
function renderLogin() {
  document.title = 'Masuk - DaiTea';
  document.getElementById('app-root').innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="brand">DaiTea<span>.</span></div>
        <p class="auth-tag">Rencanakan harimu, lacak progresmu.</p>
        <div class="auth-toggle">
          <button id="tab-login" class="active" onclick="switchAuthTab('login')">Masuk</button>
          <button id="tab-register" onclick="switchAuthTab('register')">Daftar</button>
        </div>
        <div id="auth-error" class="auth-error"></div>
        <form id="form-login" onsubmit="doLogin(event)">
          <div class="field"><label>Email</label><input type="email" id="login-email" required autocomplete="email"></div>
          <div class="field"><label>Kata Sandi</label><input type="password" id="login-password" required autocomplete="current-password" minlength="6"></div>
          <button class="btn" style="width:100%" type="submit" id="login-btn">Masuk</button>
        </form>
        <form id="form-register" style="display:none" onsubmit="doRegister(event)">
          <div class="field"><label>Nama Lengkap</label><input type="text" id="reg-name" required autocomplete="name"></div>
          <div class="field"><label>Email</label><input type="email" id="reg-email" required autocomplete="email"></div>
          <div class="field"><label>Kata Sandi (min. 6 karakter)</label><input type="password" id="reg-password" required autocomplete="new-password" minlength="6"></div>
          <button class="btn" style="width:100%" type="submit" id="reg-btn">Buat Akun</button>
        </form>
      </div>
    </div>`;
}

function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  hideAuthError();
}
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.add('show');
}
function hideAuthError() {
  document.getElementById('auth-error').classList.remove('show');
}

async function doLogin(e) {
  e.preventDefault();
  hideAuthError();
  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Memproses...';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  btn.disabled = false; btn.textContent = 'Masuk';
  if (error) { showAuthError('Email atau kata sandi salah.'); return; }
  window.location.hash = '#/dashboard';
}

async function doRegister(e) {
  e.preventDefault();
  hideAuthError();
  const btn = document.getElementById('reg-btn');
  btn.disabled = true; btn.textContent = 'Memproses...';
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  const { data, error } = await supabaseClient.auth.signUp({
    email, password, options: { data: { full_name: name } }
  });
  if (error) { btn.disabled = false; btn.textContent = 'Buat Akun'; showAuthError(error.message); return; }

  if (data.user) {
    await supabaseClient.from('profiles').upsert({ id: data.user.id, full_name: name });
  }
  btn.disabled = false; btn.textContent = 'Buat Akun';

  if (data.session) {
    window.location.hash = '#/dashboard';
  } else {
    showAuthError('Akun dibuat. Cek email kamu untuk konfirmasi, lalu masuk.');
    switchAuthTab('login');
  }
}

// =====================================================================
// DASHBOARD
// =====================================================================
function viewDashboard() {
  return `
    <div class="grid grid-3">
      <div class="card stat">
        <span class="label">Progres Hari Ini</span>
        <span class="value" id="stat-progress">-</span>
        <div class="progress-track" style="margin-top:6px;"><div class="progress-fill" id="stat-progress-bar" style="width:0%"></div></div>
      </div>
      <div class="card stat">
        <span class="label">Lamaran Aktif</span>
        <span class="value" id="stat-jobs">-</span>
        <span class="label">menunggu / diproses</span>
      </div>
      <div class="card stat">
        <span class="label">Total Lamaran</span>
        <span class="value" id="stat-jobs-total">-</span>
        <span class="label">sepanjang waktu</span>
      </div>
    </div>
    <div class="card" style="margin-top:14px;">
      <h3 style="margin-bottom:10px;">Rencana Hari Ini</h3>
      <div id="today-list"></div>
    </div>
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <h3>Rata-Rata Penggunaan Aplikasi</h3>
        <select id="usage-period" style="width:auto;" onchange="dashLoadUsage()">
          <option value="1">Hari ini</option>
          <option value="3">3 hari terakhir</option>
          <option value="7" selected>7 hari terakhir</option>
        </select>
      </div>
      <div id="usage-list"></div>
    </div>`;
}

function initDashboard() {
  document.getElementById('topbar-extra').innerHTML =
    `<div style="color:var(--muted); font-size:13.5px;">${formatTanggalIndo(todayStr())}</div>`;
  dashLoadToday();
  dashLoadJobs();
  dashLoadUsage();
}

async function dashLoadToday() {
  const { data: rowsData } = await supabaseClient
    .from('daily_activity_log').select('*').eq('tanggal', todayStr()).order('urutan', { ascending: true });
  const list = document.getElementById('today-list');
  if (!list) return;

  if (!rowsData || rowsData.length === 0) {
    list.innerHTML = `<div class="empty">Belum ada rencana untuk hari ini.
      <div><a class="btn secondary" href="#/daily-activity">Buat dari template</a></div></div>`;
    document.getElementById('stat-progress').textContent = '-';
    return;
  }

  const done = rowsData.filter(r => r.ceklis).length;
  const pct = Math.round((done / rowsData.length) * 100);
  document.getElementById('stat-progress').textContent = pct + '%';
  document.getElementById('stat-progress-bar').style.width = pct + '%';

  list.innerHTML = rowsData.slice(0, 6).map(r => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
      <div>
        <div style="font-weight:600; font-size:13.5px;">${r.kegiatan}</div>
        <div style="color:var(--muted); font-size:12px;">${r.jam_mulai || ''} ${r.jam_selesai ? '- ' + r.jam_selesai : ''}</div>
      </div>
      <span class="badge ${r.ceklis ? 'ceklis' : 'belum'}">${r.ceklis ? 'Selesai' : 'Belum'}</span>
    </div>`).join('') + `<div style="margin-top:10px;"><a href="#/daily-activity">Lihat & isi selengkapnya →</a></div>`;
}

async function dashLoadJobs() {
  const { data: rowsData } = await supabaseClient.from('job_applications').select('status');
  const total = rowsData ? rowsData.length : 0;
  const aktif = rowsData ? rowsData.filter(r => ['Menunggu', 'Diproses', 'Interview'].includes(r.status)).length : 0;
  document.getElementById('stat-jobs').textContent = aktif;
  document.getElementById('stat-jobs-total').textContent = total;
}

async function dashLoadUsage() {
  const sel = document.getElementById('usage-period');
  const days = parseInt(sel.value, 10);
  const since = addDays(todayStr(), -(days - 1));

  const { data: rowsData } = await supabaseClient
    .from('app_usage_tracking').select('nama_app, durasi_menit, tanggal')
    .gte('tanggal', since).lte('tanggal', todayStr());

  const box = document.getElementById('usage-list');
  if (!rowsData || rowsData.length === 0) {
    box.innerHTML = `<div class="empty">Belum ada data penggunaan aplikasi pada periode ini.
      <div><a class="btn secondary" href="#/app-usage">Setor penggunaan aplikasi</a></div></div>`;
    return;
  }

  const byApp = {};
  rowsData.forEach(r => {
    if (!byApp[r.nama_app]) byApp[r.nama_app] = { total: 0 };
    byApp[r.nama_app].total += r.durasi_menit;
  });

  const list = Object.entries(byApp).map(([app, v]) => ({ app, avg: v.total / days })).sort((a, b) => b.avg - a.avg);
  const maxAvg = Math.max(...list.map(x => x.avg), 1);

  box.innerHTML = list.map(x => `
    <div style="margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; font-size:13.5px; margin-bottom:4px;">
        <span style="font-weight:600;">${x.app}</span>
        <span style="color:var(--muted);">rata-rata ${Math.round(x.avg)} menit/hari</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${(x.avg / maxAvg) * 100}%; background:var(--accent);"></div></div>
    </div>`).join('');
}

// =====================================================================
// SET DAILY
// =====================================================================
let sdItems = [];

function viewSetDaily() {
  return `
    <p style="color:var(--muted); font-size:13.5px; margin-bottom:14px;">
      Ini rencana harianmu. Perubahan di sini akan dipakai untuk hari-hari berikutnya di menu Daily Activity —
      catatan yang sudah kamu isi di hari-hari sebelumnya tidak akan berubah.
    </p>
    <div class="card" id="sd-form-card" style="display:none;">
      <h3 id="sd-form-title" style="margin-bottom:12px;">Tambah Kegiatan</h3>
      <input type="hidden" id="sd-edit-id">
      <div class="field-row">
        <div class="field"><label>Jam Mulai</label><input type="time" id="sd-jam-mulai"></div>
        <div class="field"><label>Jam Selesai</label><input type="time" id="sd-jam-selesai"></div>
      </div>
      <div class="field"><label>Kegiatan</label><input type="text" id="sd-kegiatan" placeholder="Contoh: Olahraga" required></div>
      <div class="row-actions">
        <button class="btn" onclick="saveSdItem()">Simpan</button>
        <button class="btn secondary" onclick="closeSdForm()">Batal</button>
      </div>
    </div>
    <div class="card">
      <table>
        <thead><tr><th style="width:36px;"></th><th>Jam</th><th>Kegiatan</th><th style="width:110px;"></th></tr></thead>
        <tbody id="sd-body"></tbody>
      </table>
      <div id="sd-empty" class="empty" style="display:none;">Belum ada rencana harian. Mulai dengan menambah kegiatan pertama.</div>
    </div>`;
}

function initSetDaily() {
  document.getElementById('topbar-extra').innerHTML =
    `<button class="btn" onclick="openSdForm()">+ Tambah Kegiatan</button>`;
  loadSdItems();
}

async function loadSdItems() {
  const { data } = await supabaseClient.from('daily_plan_template').select('*').order('urutan', { ascending: true });
  sdItems = data || [];
  renderSdItems();
}

function renderSdItems() {
  const body = document.getElementById('sd-body');
  const empty = document.getElementById('sd-empty');
  if (sdItems.length === 0) { body.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  body.innerHTML = sdItems.map((it, idx) => `
    <tr>
      <td>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <button class="btn ghost" style="padding:2px;" onclick="moveSdItem(${idx},-1)" ${idx === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn ghost" style="padding:2px;" onclick="moveSdItem(${idx},1)" ${idx === sdItems.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      </td>
      <td>${it.jam_mulai || '-'}${it.jam_selesai ? ' - ' + it.jam_selesai : ''}</td>
      <td>${it.kegiatan}</td>
      <td class="row-actions">
        <button class="btn secondary" onclick="editSdItem('${it.id}')">Edit</button>
        <button class="btn danger" onclick="deleteSdItem('${it.id}')">Hapus</button>
      </td>
    </tr>`).join('');
}

function openSdForm() {
  document.getElementById('sd-form-card').style.display = 'block';
  document.getElementById('sd-form-title').textContent = 'Tambah Kegiatan';
  document.getElementById('sd-edit-id').value = '';
  document.getElementById('sd-jam-mulai').value = '';
  document.getElementById('sd-jam-selesai').value = '';
  document.getElementById('sd-kegiatan').value = '';
}
function closeSdForm() { document.getElementById('sd-form-card').style.display = 'none'; }

function editSdItem(id) {
  const it = sdItems.find(x => x.id === id);
  if (!it) return;
  openSdForm();
  document.getElementById('sd-form-title').textContent = 'Edit Kegiatan';
  document.getElementById('sd-edit-id').value = it.id;
  document.getElementById('sd-jam-mulai').value = it.jam_mulai || '';
  document.getElementById('sd-jam-selesai').value = it.jam_selesai || '';
  document.getElementById('sd-kegiatan').value = it.kegiatan;
}

async function saveSdItem() {
  const kegiatan = document.getElementById('sd-kegiatan').value.trim();
  if (!kegiatan) { showToast('Nama kegiatan wajib diisi'); return; }
  const id = document.getElementById('sd-edit-id').value;
  const payload = {
    jam_mulai: document.getElementById('sd-jam-mulai').value || null,
    jam_selesai: document.getElementById('sd-jam-selesai').value || null,
    kegiatan,
  };
  if (id) {
    await supabaseClient.from('daily_plan_template').update(payload).eq('id', id);
  } else {
    payload.user_id = currentUser.id;
    payload.urutan = sdItems.length;
    await supabaseClient.from('daily_plan_template').insert(payload);
  }
  closeSdForm();
  showToast('Tersimpan');
  loadSdItems();
}

async function deleteSdItem(id) {
  if (!confirm('Hapus kegiatan ini dari rencana harian?')) return;
  await supabaseClient.from('daily_plan_template').delete().eq('id', id);
  showToast('Dihapus');
  loadSdItems();
}

async function moveSdItem(idx, dir) {
  const other = idx + dir;
  if (other < 0 || other >= sdItems.length) return;
  const a = sdItems[idx], b = sdItems[other];
  await supabaseClient.from('daily_plan_template').update({ urutan: other }).eq('id', a.id);
  await supabaseClient.from('daily_plan_template').update({ urutan: idx }).eq('id', b.id);
  loadSdItems();
}

// =====================================================================
// DAILY ACTIVITY
// =====================================================================
let daCurrentDate = todayStr();
let daRows = [];

function viewDailyActivity() {
  return `
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div class="date-nav">
          <button class="btn secondary" onclick="daChangeDate(-1)">←</button>
          <input type="date" id="da-date-picker" onchange="daOnDatePicked()">
          <button class="btn secondary" onclick="daChangeDate(1)">→</button>
          <button class="btn ghost" onclick="daGoToday()">Hari ini</button>
        </div>
        <div class="stat" style="align-items:flex-end;">
          <span class="label">Progres</span>
          <span class="value" id="da-progress">-</span>
        </div>
      </div>
    </div>
    <div class="card">
      <div id="da-empty" class="empty" style="display:none;">
        Belum ada rencana untuk tanggal ini.
        <div><button class="btn secondary" onclick="daGenerateFromTemplate()">Buat dari Set Daily</button></div>
      </div>
      <div id="da-list"></div>
      <div style="margin-top:14px;"><button class="btn ghost" onclick="daAddExtra()">+ Tambah kegiatan lain hari ini</button></div>
    </div>`;
}

function initDailyActivity() {
  document.getElementById('da-date-picker').value = daCurrentDate;
  daLoadDay();
}

function daOnDatePicked() {
  daCurrentDate = document.getElementById('da-date-picker').value;
  daLoadDay();
}
function daChangeDate(delta) {
  daCurrentDate = addDays(daCurrentDate, delta);
  document.getElementById('da-date-picker').value = daCurrentDate;
  daLoadDay();
}
function daGoToday() {
  daCurrentDate = todayStr();
  document.getElementById('da-date-picker').value = daCurrentDate;
  daLoadDay();
}

async function daLoadDay() {
  const { data } = await supabaseClient
    .from('daily_activity_log').select('*').eq('tanggal', daCurrentDate).order('urutan', { ascending: true });
  daRows = data || [];
  daRenderList();
}

function daRenderList() {
  const list = document.getElementById('da-list');
  const empty = document.getElementById('da-empty');

  if (daRows.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    document.getElementById('da-progress').textContent = '-';
    return;
  }
  empty.style.display = 'none';

  const done = daRows.filter(r => r.ceklis).length;
  document.getElementById('da-progress').textContent = Math.round((done / daRows.length) * 100) + '%';

  list.innerHTML = daRows.map(r => `
    <div class="card" style="margin-top:10px; padding:14px 16px;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
        <label style="display:flex; gap:10px; align-items:flex-start; cursor:pointer; flex:1;">
          <input type="checkbox" style="width:auto; margin-top:3px;" ${r.ceklis ? 'checked' : ''} onchange="daToggleCeklis('${r.id}', this.checked)">
          <div style="flex:1;">
            <input type="text" value="${r.kegiatan.replace(/"/g, '&quot;')}" style="border:none; background:none; font-weight:600; padding:0; font-size:14.5px;" onchange="daUpdateField('${r.id}','kegiatan',this.value)">
            <div style="color:var(--muted); font-size:12px; margin-top:2px;">
              <input type="time" value="${r.jam_mulai || ''}" style="display:inline-block; width:auto; border:none; padding:0; font-size:12px; color:var(--muted);" onchange="daUpdateField('${r.id}','jam_mulai',this.value)">
              -
              <input type="time" value="${r.jam_selesai || ''}" style="display:inline-block; width:auto; border:none; padding:0; font-size:12px; color:var(--muted);" onchange="daUpdateField('${r.id}','jam_selesai',this.value)">
            </div>
          </div>
        </label>
        <button class="btn danger" style="padding:6px 10px;" onclick="daRemoveItem('${r.id}')">Hapus</button>
      </div>
      <textarea placeholder="Keterangan / catatan..." style="margin-top:10px; min-height:44px;" onchange="daUpdateField('${r.id}','keterangan',this.value)">${r.keterangan || ''}</textarea>
    </div>`).join('');
}

async function daGenerateFromTemplate() {
  const { data: template } = await supabaseClient.from('daily_plan_template').select('*').order('urutan', { ascending: true });
  if (!template || template.length === 0) {
    showToast('Rencana harian masih kosong, atur dulu di menu Set Daily');
    return;
  }
  const payload = template.map(t => ({
    user_id: currentUser.id, tanggal: daCurrentDate, template_id: t.id,
    jam_mulai: t.jam_mulai, jam_selesai: t.jam_selesai, kegiatan: t.kegiatan, urutan: t.urutan, ceklis: false,
  }));
  await supabaseClient.from('daily_activity_log').insert(payload);
  showToast('Rencana hari ini dibuat dari Set Daily');
  daLoadDay();
}

async function daAddExtra() {
  const maxUrutan = daRows.reduce((m, r) => Math.max(m, r.urutan || 0), -1);
  const { data, error } = await supabaseClient.from('daily_activity_log').insert({
    user_id: currentUser.id, tanggal: daCurrentDate, kegiatan: 'Kegiatan baru', urutan: maxUrutan + 1, ceklis: false,
  }).select().single();
  if (!error) { daRows.push(data); daRenderList(); }
}

async function daToggleCeklis(id, val) {
  await supabaseClient.from('daily_activity_log').update({ ceklis: val }).eq('id', id);
  const r = daRows.find(x => x.id === id); if (r) r.ceklis = val;
  const done = daRows.filter(r => r.ceklis).length;
  document.getElementById('da-progress').textContent = Math.round((done / daRows.length) * 100) + '%';
}

async function daUpdateField(id, field, value) {
  await supabaseClient.from('daily_activity_log').update({ [field]: value }).eq('id', id);
  showToast('Tersimpan');
}

async function daRemoveItem(id) {
  if (!confirm('Hapus kegiatan ini dari hari ini?')) return;
  await supabaseClient.from('daily_activity_log').delete().eq('id', id);
  daRows = daRows.filter(r => r.id !== id);
  daRenderList();
}

// =====================================================================
// JOB TRACKING
// =====================================================================
let jobItems = [];

function viewJobTracking() {
  return `
    <div class="card" id="job-form-card" style="display:none;">
      <h3 id="job-form-title" style="margin-bottom:12px;">Tambah Lamaran</h3>
      <input type="hidden" id="job-edit-id">
      <div class="field-row">
        <div class="field"><label>Tanggal Melamar</label><input type="date" id="job-tanggal" required></div>
        <div class="field"><label>Perusahaan</label><input type="text" id="job-perusahaan" placeholder="Nama perusahaan" required></div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Kirim Via</label>
          <select id="job-metode-pilihan" onchange="toggleJobMetodeLain()">
            <option value="Email">Email</option>
            <option value="Web Resmi">Website Resmi</option>
            <option value="JobStreet">JobStreet</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Lainnya">Lainnya...</option>
          </select>
        </div>
        <div class="field" id="job-metode-lain-wrap" style="display:none;">
          <label>Sebutkan</label>
          <input type="text" id="job-metode-lain" placeholder="Contoh: Indeed, walk-in">
        </div>
      </div>
      <div class="field">
        <label>Status</label>
        <select id="job-status">
          <option value="Menunggu">Menunggu</option>
          <option value="Diproses">Diproses</option>
          <option value="Interview">Interview</option>
          <option value="Diterima">Diterima</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>
      <div class="field"><label>Hasil Akhir</label><textarea id="job-hasil" placeholder="Catatan hasil, misalnya jadwal interview atau alasan ditolak..."></textarea></div>
      <div class="row-actions">
        <button class="btn" onclick="saveJobItem()">Simpan</button>
        <button class="btn secondary" onclick="closeJobForm()">Batal</button>
      </div>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Tanggal</th><th>Perusahaan</th><th>Via</th><th>Status</th><th>Hasil</th><th style="width:100px;"></th></tr></thead>
        <tbody id="job-body"></tbody>
      </table>
      <div id="job-empty" class="empty" style="display:none;">Belum ada lamaran yang dicatat.</div>
    </div>`;
}

function initJobTracking() {
  document.getElementById('topbar-extra').innerHTML =
    `<button class="btn" onclick="openJobForm()">+ Tambah Lamaran</button>`;
  loadJobItems();
}

function toggleJobMetodeLain() {
  const v = document.getElementById('job-metode-pilihan').value;
  document.getElementById('job-metode-lain-wrap').style.display = v === 'Lainnya' ? 'block' : 'none';
}

async function loadJobItems() {
  const { data } = await supabaseClient.from('job_applications').select('*').order('tanggal_melamar', { ascending: false });
  jobItems = data || [];
  renderJobItems();
}

function renderJobItems() {
  const body = document.getElementById('job-body');
  const empty = document.getElementById('job-empty');
  if (jobItems.length === 0) { body.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  body.innerHTML = jobItems.map(it => `
    <tr>
      <td>${it.tanggal_melamar}</td>
      <td style="font-weight:600;">${it.perusahaan}</td>
      <td>${it.metode_kirim || '-'}</td>
      <td><span class="badge ${STATUS_CLASS[it.status] || ''}">${it.status}</span></td>
      <td style="max-width:220px;">${it.hasil_akhir || '-'}</td>
      <td class="row-actions">
        <button class="btn secondary" onclick="editJobItem('${it.id}')">Edit</button>
        <button class="btn danger" onclick="deleteJobItem('${it.id}')">Hapus</button>
      </td>
    </tr>`).join('');
}

function openJobForm() {
  document.getElementById('job-form-card').style.display = 'block';
  document.getElementById('job-form-title').textContent = 'Tambah Lamaran';
  document.getElementById('job-edit-id').value = '';
  document.getElementById('job-tanggal').value = todayStr();
  document.getElementById('job-perusahaan').value = '';
  document.getElementById('job-metode-pilihan').value = 'Email';
  document.getElementById('job-metode-lain').value = '';
  document.getElementById('job-metode-lain-wrap').style.display = 'none';
  document.getElementById('job-status').value = 'Menunggu';
  document.getElementById('job-hasil').value = '';
}
function closeJobForm() { document.getElementById('job-form-card').style.display = 'none'; }

function editJobItem(id) {
  const it = jobItems.find(x => x.id === id);
  if (!it) return;
  openJobForm();
  document.getElementById('job-form-title').textContent = 'Edit Lamaran';
  document.getElementById('job-edit-id').value = it.id;
  document.getElementById('job-tanggal').value = it.tanggal_melamar;
  document.getElementById('job-perusahaan').value = it.perusahaan;
  const known = ['Email', 'Web Resmi', 'JobStreet', 'LinkedIn'];
  if (known.includes(it.metode_kirim)) {
    document.getElementById('job-metode-pilihan').value = it.metode_kirim;
  } else {
    document.getElementById('job-metode-pilihan').value = 'Lainnya';
    document.getElementById('job-metode-lain').value = it.metode_kirim || '';
    document.getElementById('job-metode-lain-wrap').style.display = 'block';
  }
  document.getElementById('job-status').value = it.status;
  document.getElementById('job-hasil').value = it.hasil_akhir || '';
}

async function saveJobItem() {
  const perusahaan = document.getElementById('job-perusahaan').value.trim();
  const tanggal = document.getElementById('job-tanggal').value;
  if (!perusahaan || !tanggal) { showToast('Tanggal dan nama perusahaan wajib diisi'); return; }

  const pilihan = document.getElementById('job-metode-pilihan').value;
  const metode = pilihan === 'Lainnya' ? document.getElementById('job-metode-lain').value.trim() : pilihan;

  const payload = {
    tanggal_melamar: tanggal, perusahaan, metode_kirim: metode,
    status: document.getElementById('job-status').value,
    hasil_akhir: document.getElementById('job-hasil').value.trim(),
  };

  const id = document.getElementById('job-edit-id').value;
  if (id) {
    await supabaseClient.from('job_applications').update(payload).eq('id', id);
  } else {
    payload.user_id = currentUser.id;
    await supabaseClient.from('job_applications').insert(payload);
  }
  closeJobForm();
  showToast('Tersimpan');
  loadJobItems();
}

async function deleteJobItem(id) {
  if (!confirm('Hapus catatan lamaran ini?')) return;
  await supabaseClient.from('job_applications').delete().eq('id', id);
  showToast('Dihapus');
  loadJobItems();
}

// =====================================================================
// APP USAGE
// =====================================================================
let usRowCounter = 0;

function viewAppUsage() {
  return `
    <div class="card">
      <h3 style="margin-bottom:12px;">Setor Penggunaan Hari Ini</h3>
      <p style="color:var(--muted); font-size:13px; margin-bottom:12px;">
        Isi durasi pemakaian tiap aplikasi (menit) untuk tanggal di bawah. Data ini yang dirata-ratakan di Dashboard.
      </p>
      <div class="field"><label>Tanggal</label><input type="date" id="us-entry-date" style="max-width:200px;" onchange="usLoadEntryDate()"></div>
      <div id="us-entry-rows"></div>
      <button class="btn ghost" onclick="usAddRow()">+ Tambah aplikasi</button>
      <div style="margin-top:12px;"><button class="btn" onclick="usSaveEntries()">Simpan Semua</button></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px;">Riwayat Terbaru</h3>
      <table>
        <thead><tr><th>Tanggal</th><th>Aplikasi</th><th>Durasi</th><th style="width:70px;"></th></tr></thead>
        <tbody id="us-history-body"></tbody>
      </table>
      <div id="us-history-empty" class="empty" style="display:none;">Belum ada riwayat penggunaan aplikasi.</div>
    </div>`;
}

function initAppUsage() {
  document.getElementById('us-entry-date').value = todayStr();
  usLoadEntryDate();
  usLoadHistory();
}

function usAddRow(app = '', menit = '') {
  usRowCounter++;
  const wrap = document.getElementById('us-entry-rows');
  const div = document.createElement('div');
  div.className = 'field-row';
  div.id = 'us-row-' + usRowCounter;
  div.innerHTML = `
    <div class="field"><input type="text" placeholder="Nama aplikasi (mis. MLBB)" value="${app}" data-role="app"></div>
    <div class="field" style="max-width:140px;"><input type="number" min="0" placeholder="Menit" value="${menit}" data-role="menit"></div>
    <button class="btn danger" style="height:38px;" onclick="document.getElementById('us-row-${usRowCounter}').remove()">Hapus</button>`;
  wrap.appendChild(div);
}

async function usLoadEntryDate() {
  document.getElementById('us-entry-rows').innerHTML = '';
  const date = document.getElementById('us-entry-date').value;
  const { data } = await supabaseClient.from('app_usage_tracking').select('*').eq('tanggal', date);
  if (data && data.length > 0) {
    data.forEach(d => usAddRow(d.nama_app, d.durasi_menit));
  } else {
    usAddRow();
  }
}

async function usSaveEntries() {
  const date = document.getElementById('us-entry-date').value;
  if (!date) { showToast('Pilih tanggal dulu'); return; }

  await supabaseClient.from('app_usage_tracking').delete().eq('tanggal', date);

  const rowsEls = [...document.getElementById('us-entry-rows').children];
  const payload = rowsEls.map(r => ({
    user_id: currentUser.id, tanggal: date,
    nama_app: r.querySelector('[data-role="app"]').value.trim(),
    durasi_menit: parseInt(r.querySelector('[data-role="menit"]').value || '0', 10),
  })).filter(p => p.nama_app);

  if (payload.length > 0) {
    await supabaseClient.from('app_usage_tracking').insert(payload);
  }
  showToast('Penggunaan aplikasi tersimpan');
  usLoadHistory();
}

async function usLoadHistory() {
  const { data } = await supabaseClient.from('app_usage_tracking').select('*').order('tanggal', { ascending: false }).limit(30);
  const body = document.getElementById('us-history-body');
  const empty = document.getElementById('us-history-empty');
  if (!data || data.length === 0) { body.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  body.innerHTML = data.map(d => `
    <tr>
      <td>${d.tanggal}</td>
      <td style="font-weight:600;">${d.nama_app}</td>
      <td>${d.durasi_menit} menit</td>
      <td><button class="btn danger" onclick="usDeleteEntry('${d.id}')">Hapus</button></td>
    </tr>`).join('');
}

async function usDeleteEntry(id) {
  if (!confirm('Hapus data ini?')) return;
  await supabaseClient.from('app_usage_tracking').delete().eq('id', id);
  usLoadHistory();
}
