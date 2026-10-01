# AxonAfricaFrontend

# AxonAfrica Frontend

React + Vite website for AxonAfrica, built from `Website.docx` (brand, copy, Phase 1 scope).

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing (hero, pathway, program, impact, get involved) |
| `/program` | Digital Health Leaders Program |
| `/apply` | 4-step application (draft autosave â†’ API) |
| `/innovators` | Cohort gallery / Apply CTA |
| `/about` | Story, mission, team |
| `/get-involved` | Fund / Partner / Volunteer forms |
| `/stories` | News + contact |

Summit and Awards are **out of scope** for this release (per the brief).

## Design system

- **Colors:** Sun Gold `#FBBE04`, Amber `#BA6B04`, Leaf/Field/Deep greens, Off-white `#F7F7F7`, Ink `#142014`
- **Type:** Poppins (headlines), Inter (body)
- **Motion:** scroll reveal + Seedâ†’Plantâ†’Canopy path draw (respects `prefers-reduced-motion`)

## Run locally

```bash
cd frontend
copy .env.example .env   # set VITE_API_URL to your API
npm install
npm run dev
```

Open http://127.0.0.1:5173

API default: `http://127.0.0.1:8000` (see `.env.example`).  
Vite also proxies `/api` to that host.

## Build

```bash
npm run build
npm run preview
```

Pre-deploy corrections checklist: [`docs/PREDEPLOY_CHECKLIST.md`](docs/PREDEPLOY_CHECKLIST.md)

Hero background editor: open the site with `?edit=1` (e.g. `http://127.0.0.1:5173/?edit=1`).

## API wiring

- `POST /api/v1/applications/` â€” Apply form
- `GET /api/v1/partners/`, `/impact/stats/`, `/innovators/`, `/team/`, `/news/`
- `POST /api/v1/involvement/fund-cohort|partner|volunteer/`

Ensure Render `CORS_ALLOWED_ORIGINS` includes the frontend origin.

