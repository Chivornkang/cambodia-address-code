# Cambodia Explorer

Interactive map of Cambodia (React + Vite). Click a province to see its districts, communes and villages.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Deploy on Vercel

1. Push this folder to GitHub.
2. Vercel → **Add New Project** → import the repo.
3. Framework preset: **Vite** (build `npm run build`, output `dist`). `vercel.json` already handles SPA routing.

## Data

- `public/data/provinces.json` – province summary (counts + area)
- `public/data/p/<code>.json` – district → commune → village tree per province
- `src/data/mapData.json` – SVG province shapes (from geoBoundaries ADM1, CC BY 4.0)

All generated from `CambodiaGeographicalList2025_Full.csv`.

## Postal codes

The CSV has no postal codes, so none are shown by default. To display them, fill
`public/data/postcodes.json` with the official codes keyed by the CSV admin code:

```json
{
  "12": "12000",
  "1201": "12100",
  "120101": "12101"
}
```

Province (2 digits), district (4), commune (6) keys are supported; villages show their
commune's code. Badges and the postal-code stat appear automatically for any code listed.
