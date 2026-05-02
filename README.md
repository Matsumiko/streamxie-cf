<p align="center">
  <img src="./src/assets/streamxie-brand-logo.png" alt="Logo streamXie" width="112" />
</p>

<h1 align="center">streamXie</h1>

<p align="center">
  Frontend katalog film/series + API proxy Cloudflare Pages + auth akun berbasis sesi.
</p>

---

## Ringkasan

`streamXie` adalah aplikasi React untuk penelusuran katalog dan pemutaran berbasis provider, dengan:

- metadata TMDB lewat endpoint server-side `/api/tmdb/*`
- endpoint provider lewat `/api/xie/*`
- auth akun (`/api/auth/*`) dan sinkron state akun (`/api/user/state`)

Deploy produksi aktif:

- `https://streamxie.pages.dev`

Repo sumber:

- `https://github.com/Matsumiko/streamxie-cf.git`

---

## Stack Teknis

- React 18 + TypeScript + Vite
- Tailwind CSS
- Cloudflare Pages Functions
- D1 (`AUTH_DB`) untuk user/session/auth audit
- Turso (`user_state`) untuk data akun (my list, progress, search history, avatar)
- Playwright untuk smoke QA

---

## Menjalankan Lokal

```bash
npm ci
npm run dev
```

Verifikasi cepat:

```bash
npm run typecheck
npm run build
npm run qa:smoke
```

---

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name streamxie --branch main --env-file cloudflare.env
```

---

## Struktur Proyek

```text
streamxie/
├─ src/                  # UI React (pages, components, hooks, lib)
├─ functions/            # Cloudflare Pages Functions (api/auth/tmdb/xie/user-state)
├─ db/                   # Skema D1/Turso
├─ tests/smoke/          # Smoke tests Playwright
├─ static/_headers       # Header policy untuk Pages
└─ CODER.md              # Panduan operasional proyek (Bahasa Indonesia)
```

---

## Keamanan

Jangan commit file sensitif:

- `cloudflare.env`
- `secret.pegangan.owner.env`
- `.env*`
- `.wrangler/`
- `dist/`
- `node_modules/`
- `.runbook/`

Semua secret runtime disuplai via Cloudflare secret/binding server-side.
