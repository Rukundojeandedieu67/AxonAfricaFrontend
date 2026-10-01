# Deploy the AxonAfrica frontend

Repo: https://github.com/Rukundojeandedieu67/AxonAfricaFrontend

## 1. Point at your API

You need the live Django URL from Render (example):

```text
https://axonafrica-api.onrender.com
```

Set as build env (no trailing slash):

```env
VITE_API_URL=https://YOUR-API.onrender.com
```

## 2. Allow the frontend origin on the API

On the **backend** Render service → Environment:

```env
CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND.onrender.com,http://localhost:5173
FRONTEND_URL=https://YOUR-FRONTEND.onrender.com
```

Redeploy the API after changing CORS.

## 3A. Deploy on Render (Static Site)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Static Site**
2. Connect `Rukundojeandedieu67/AxonAfricaFrontend`
3. Settings:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
4. Environment: `VITE_API_URL` = your API URL
5. Create Static Site → wait for build

SPA routing is covered by `public/_redirects` and `render.yaml`.

Or use Blueprint: **New → Blueprint** with this repo’s `render.yaml`.

## 3B. Deploy on Vercel (optional)

1. [vercel.com](https://vercel.com) → Import `AxonAfricaFrontend`
2. Framework: Vite
3. Env: `VITE_API_URL`
4. Deploy (`vercel.json` rewrites all routes to `index.html`)

## 4. Smoke test

- `/` loads with logo
- `/api` calls work (check Network → `impact/stats` or similar)
- `/apply` can submit (API up + CORS ok)
- Mobile menu + Apply button

## 5. Editor-only hero background

`https://YOUR-FRONTEND/?edit=1`
