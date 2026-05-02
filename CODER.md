# CODER.md

Dokumen memori proyek untuk developer/agent.
Wajib dibaca di awal sesi.

---

## Ringkasan Proyek

- **Nama proyek:** streamXie
- **Tipe:** Frontend React + Cloudflare Pages Functions
- **Stack utama:** React 18, Vite, Tailwind CSS, TypeScript
- **Auth & sesi:** endpoint `/api/auth/*` + cookie `sx_session` (`HttpOnly`, `Secure`, `SameSite=Lax`)
- **Data akun:** D1 (`AUTH_DB`) + Turso (`user_state`)
- **Deploy utama:** Cloudflare Pages `https://streamxie.pages.dev`
- **Repo GitHub:** `https://github.com/Matsumiko/streamxie-cf.git` (`main`)

---

## Konteks Environment

- Workspace aktif di Windows (`D:\CLOUDFLARE\streamxie-indevs-in\streamxie`).
- Proyek asal dari WSL; path ekuivalen WSL:  
  `/mnt/d/CLOUDFLARE/streamxie-indevs-in/streamxie`.
- Shell default: PowerShell.

---

## Perintah Penting

```bash
# install dependency
npm ci

# dev
npm run dev

# typecheck
npm run typecheck

# build
npm run build

# smoke test
npm run qa:smoke

# deploy Cloudflare Pages
npx wrangler pages deploy dist --project-name streamxie --branch main --env-file cloudflare.env
```

Untuk smoke ke URL tertentu:

```powershell
$env:SMOKE_BASE_URL="https://<preview>.streamxie.pages.dev"
npm run qa:smoke
```

---

## Arsitektur Singkat

- Frontend memakai route client-side (`src/pages/*`) dan komponen reusable (`src/components/*`).
- Proxy API server-side:
  - `/api/tmdb/*` -> TMDB resmi (token server-side).
  - `/api/xie/*` -> provider stream terpilih.
  - `/api/auth/*` + `/api/user/state` -> auth + sinkron data akun.
- State lokal tetap ada untuk UX, tapi akun login disinkron ke backend.

---

## Aturan Deploy + Push

Urutan default setelah tugas selesai:
1. Verifikasi (`typecheck`, `build`, smoke sesuai kebutuhan).
2. Deploy Cloudflare Pages.
3. Audit file staged (pastikan tanpa secret/artifact sensitif).
4. Commit + push ke `origin/main`.

---

## Keamanan & Secret

**Jangan pernah commit:**
- `cloudflare.env`
- `secret.pegangan.owner.env`
- file `.env*`
- `.wrangler/`
- `dist/`
- `node_modules/`
- runtime session `.runbook/sessions/*.json`

Secret runtime yang dipakai server-side:
- `CLOUDFLARE_API_TOKEN` (deploy local)
- `API_Read_Access_Token` (TMDB proxy)
- `FADZPIE_AUTH_BEARER` (provider proxy)
- `TURSO_URL` dan `TURSO_TOKEN` (state akun)

---

## Catatan Operasional

- Jika `wrangler pages dev --env-file ...` tidak memetakan secret dengan stabil, pakai binding eksplisit.
- Waspadai warning chunk size Vite (>500kB): tidak blok deploy, tapi tetap risiko performa.
- Untuk tugas frontend, utamakan konsistensi UI yang sudah ada; hindari redesign besar tanpa permintaan user.

---

## Standar Bahasa

- Dokumen kerja internal dan komentar kode baru **wajib pakai Bahasa Indonesia**.
- Kalau ada komentar lama berbahasa Inggris, ubah saat file tersebut disentuh pada tugas aktif.
