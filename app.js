// ====== KONFIGURASI SUPABASE ======
// Ganti dua nilai di bawah ini dengan Project URL dan anon public key
// dari Supabase kamu (Settings > API).
const SUPABASE_URL = "https://lwimzkpbuobacbkmklmg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3aW16a3BidW9iYWNia21rbG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMTAwOTEsImV4cCI6MjEwNTY4NjA5MX0.vR9eQxg71facEN8Hu3_QZ5SG58kGDAijHlLtq8KFpMg";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== ICON SET (inline SVG, seragam di sidebar & bottom nav) ======
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  setdaily: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  job: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  usage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>'
};

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: ICONS.dashboard },
  { key: 'setdaily', label: 'Set Daily', href: 'set-daily.html', icon: ICONS.setdaily },
  { key: 'activity', label: 'Daily Activity', href: 'daily-activity.html', icon: ICONS.activity },
  { key: 'job', label: 'Lamar Kerja', href: 'job-tracking.html', icon: ICONS.job },
  { key: 'usage', label: 'App Usage', href: 'app-usage.html', icon: ICONS.usage },
];

// Pastikan user sudah login; kalau belum, lempar ke login.html
async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session.user;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

// Render sidebar (desktop) + bottom nav (mobile) ke dalam #nav-root
function renderNav(activeKey, userLabel) {
  const root = document.getElementById('nav-root');
  if (!root) return;

  const sidebarLinks = NAV_ITEMS.map(item => `
    <a class="nav-link ${item.key === activeKey ? 'active' : ''}" href="${item.href}">
      ${item.icon}<span>${item.label}</span>
    </a>`).join('');

  const bottomLinks = NAV_ITEMS.map(item => `
    <a class="${item.key === activeKey ? 'active' : ''}" href="${item.href}">
      ${item.icon}<span>${item.label.split(' ')[0]}</span>
    </a>`).join('');

  root.innerHTML = `
    <nav class="sidebar">
      <div class="brand">Runut<span>.</span></div>
      ${sidebarLinks}
      <a class="nav-link logout" href="#" onclick="logout(); return false;">${ICONS.logout}<span>Keluar</span></a>
    </nav>
    <nav class="bottom-nav">${bottomLinks}</nav>
  `;

  const greetEl = document.getElementById('greeting-text');
  if (greetEl && userLabel) greetEl.textContent = `Halo, ${userLabel}`;
}

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

// ---- Helper tanggal & waktu ----
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
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
