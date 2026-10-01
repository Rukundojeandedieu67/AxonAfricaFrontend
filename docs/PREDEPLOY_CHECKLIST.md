# Frontend pre-deploy checklist

Use this before shipping the React site. Items marked **must** block launch; others can ship and follow up.

## Must fix / confirm before deploy

| # | Item | Status / notes |
|---|---|---|
| 1 | Set production `VITE_API_URL` to the Render API host (no trailing slash) | Env on Vercel/Netlify/host |
| 2 | Add frontend origin to API `CORS_ALLOWED_ORIGINS` | Render env |
| 3 | Replace placeholder logo plate if org delivers **transparent PNG / SVG** | Current mark has black field |
| 4 | Supply **real photography** (innovators, workspaces, clinical) — no stock | Brief requirement |
| 5 | Confirm Apply eligibility + cost copy (`[to be confirmed]` in brief) | Program / Apply pages |
| 6 | Confirm email for contact + application replies | `contact@axonafrica.org` today |
| 7 | Smoke-test Apply + Get Involved against live API | Forms → Neon |
| 8 | Mobile pass: header, hero, apply steps, 48px tap targets | Brief: mobile-first |

## Media (images & video)

| # | Item | Notes |
|---|---|---|
| 9 | Wire CMS/Cloudinary URLs into `MediaFrame` / news / innovators | Components already support `src` + `videoSrc` |
| 10 | Prefer compressed WebP/AVIF images; MP4/H.264 short clips | Lazy-load already on images |
| 11 | Provide posters for every video | `poster` prop on `MediaFrame` |
| 12 | Caption / alt text for every asset | Accessibility |
| 13 | Hide empty partner logo slots | Already: partners section only if API returns items |
| 14 | Hero background upload is **editor-only** (`/?edit=1`) | Not shown to public visitors |

## Motion & UX polish (done in app)

- Scroll reveals with stagger  
- Seed→Plant→Canopy path draw on view  
- Hero enter + soft orb motion  
- Trust-band marquee  
- Impact counters animate on scroll  
- Page enter on route change  
- Respects `prefers-reduced-motion`

## Nice-to-have after Phase 1

| # | Item |
|---|---|
| 15 | Language switcher shell (EN first) |
| 16 | Newsletter → real ESP (Mailchimp/Brevo) |
| 17 | Donate flow (cards + mobile money) |
| 18 | Applicant status dashboard (Received / Under review / …) |
| 19 | Server-side hero/media config instead of localStorage |
| 20 | Summit & Awards pages — **later phase only** (do not add now) |

## Quick local check

```bash
cd frontend
npm install
npm run build
npm run preview
# Editor tools: open http://127.0.0.1:4173/?edit=1
```
