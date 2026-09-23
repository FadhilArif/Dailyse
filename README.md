# Runut — Pelacak Rutinitas Harian

Web app untuk: rencana harian (Set Daily), pelaksanaan harian (Daily Activity),
tracking lamaran kerja, dan tracking penggunaan aplikasi — dengan Supabase
sebagai database + autentikasi. File-nya HTML/CSS/JS biasa, jadi bisa langsung
dibungkus jadi Android WebView app.

## 1. Buat project Supabase
1. Buka https://supabase.com → New Project.
2. Setelah project jadi, buka **SQL Editor** → New query → tempel isi
   `schema.sql` → Run. Ini membuat semua tabel + Row Level Security (RLS),
   jadi tiap user cuma bisa lihat & ubah datanya sendiri (standar keamanan
   aplikasi umumnya).
3. Buka **Settings > API**, salin **Project URL** dan **anon public key**.
4. Buka `app.js`, isi:
   ```js
   const SUPABASE_URL = "https://xxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGciOi....";
   ```
5. (Opsional tapi disarankan) Di **Authentication > Settings**, aktifkan
   "Confirm email" supaya pendaftaran akun diverifikasi lewat email.

## 2. Coba lokal
Buka `login.html` langsung di browser, atau jalankan server statis
sederhana (`npx serve` / VS Code Live Server) supaya path relatif antar
halaman jalan normal.

## 3. Deploy ke Vercel (sama seperti proyek My HRIS kamu sebelumnya)
1. Push semua file ini ke repo GitHub baru, misalnya `runut-app`.
2. Di Vercel: New Project → import repo tersebut → Framework preset
   "Other" (static) → Deploy.
3. Setelah live, kamu akan dapat URL seperti `runut-app.vercel.app`.

## 4. Jadi Android app (WebView)
Karena semua halaman sudah responsive dan mobile-friendly (bottom nav,
aman dari notch/status bar), kamu tinggal bungkus URL Vercel di atas
dengan WebView (mis. pakai Android Studio + `WebView` component, atau
tool no-code seperti WebViewGold/Median). Tidak perlu mengubah kode.

## Struktur menu
- **login.html** — daftar & masuk (Supabase Auth, password di-hash otomatis
  oleh Supabase, sesi pakai JWT — standar aplikasi web pada umumnya).
- **dashboard.html** — progres hari ini, ringkasan lamaran kerja, dan
  rata-rata pemakaian aplikasi (1/3/7 hari terakhir).
- **set-daily.html** — atur template rencana harian (jam + kegiatan),
  bisa diedit/diurutkan/hapus kapan saja. Perubahan berlaku untuk hari
  berikutnya, tidak mengubah catatan hari-hari yang sudah lewat.
- **daily-activity.html** — jalankan rencana per tanggal: ceklis, isi
  keterangan, atau tambah kegiatan dadakan khusus hari itu.
- **job-tracking.html** — catat lamaran: tanggal, perusahaan, kirim via
  (Email/Web Resmi/JobStreet/LinkedIn/custom), status, dan hasil akhir.
- **app-usage.html** — setor durasi pemakaian tiap aplikasi per tanggal;
  datanya dipakai untuk menghitung rata-rata di Dashboard.

## Catatan keamanan
- Semua tabel memakai Row Level Security: query hanya mengembalikan baris
  milik user yang sedang login (`auth.uid() = user_id`).
- `anon key` di `app.js` memang publik/aman dipublikasikan — akses data
  tetap dibatasi oleh RLS di atas, bukan oleh kerahasiaan key ini.
- Jangan pernah menaruh **service_role key** di file frontend.
