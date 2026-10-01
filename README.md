# AxonAfricaFrontend

React + Vite website for **AxonAfrica** (Phase 1 from the design brief).

**Live deploy guide:** [docs/DEPLOY.md](docs/DEPLOY.md)  
**Pre-launch checklist:** [docs/PREDEPLOY_CHECKLIST.md](docs/PREDEPLOY_CHECKLIST.md)

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/program` | Digital Health Leaders Program |
| `/apply` | 4-step application |
| `/innovators` | Cohort gallery |
| `/about` | Story & team |
| `/get-involved` | Fund / Partner / Volunteer |
| `/stories` | News & contact |

## Local

```bash
npm install
copy .env.example .env
npm run dev
```

Open http://127.0.0.1:5173

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Build

```bash
npm run build
npm run preview
```

## API

Backend repo: https://github.com/Rukundojeandedieu67/AxonAfrica  

Set production `VITE_API_URL` to your Render API host and add this site’s origin to backend `CORS_ALLOWED_ORIGINS`.
