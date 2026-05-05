# Taiwan Toilet Map

A free, non-commercial public toilet finder for Taiwan, built on top of the
Ministry of Environment (環境部環境管理署) open data set.

**Live site:** [toilets.littlechin.tw](https://toilets.littlechin.tw)

> Find the nearest public toilet — accessible, baby-friendly, or otherwise —
> across all 22 counties of Taiwan, with one tap.

---

## Highlights

- **One-tap location** — auto-locates on map open, instantly shows nearby toilets
  ranked by distance.
- **Smart filters** — grade (特優 / 優等 / 普通 / 加強 / 不合格), type
  (male / female / mixed / accessible / family), and a "has changing table"
  toggle that combines explicit data flags with name-based heuristics.
- **8 languages** — Traditional Chinese, English, 日本語, 한국어, Tiếng Việt,
  Bahasa Indonesia, ภาษาไทย, Filipino. Browser language is auto-detected on
  first visit.
- **Light / dark / system theme** — color tokens audited for WCAG AA
  contrast (≥ 4.5:1, mostly AAA). Dark map tiles are produced with a CSS
  filter on OSM, keeping street labels legible.
- **Accessibility first** — skip-link, semantic landmarks, `aria-label`s on
  every icon-only button, focus-visible rings, color-blind-safe badges
  (color + text, never color alone).
- **Responsive** — `100dvh` viewport math (no iOS Safari address-bar jitter),
  `overscroll-behavior: contain`, mobile-first layout.
- **Privacy** — no account, no tracking beyond anonymous Google Analytics 4
  page views (with `anonymize_ip`). Geolocation is browser-handled and never
  stored.

## Tech

| Layer | Choice |
| --- | --- |
| UI | Vue 3 + Vue Router + Vue I18n |
| Build | Vite |
| Map | Leaflet + OpenStreetMap tiles |
| Geocoding | Nominatim (OSM) |
| Hosting | GitHub Pages, custom domain |
| Automation | GitHub Actions (data sync, deploy, health-check) |
| Analytics | Google Analytics 4 |

## Quick start

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Data pipeline

1. **Fetch** — `npm run fetch-data` pulls the latest dataset from the
   Ministry of Environment open data API. Requires a free API key:
   ```bash
   export MOENV_API_KEY=your_api_key
   npm run fetch-data
   ```
2. **Normalize** — `npm run normalize-data` cleans, dedupes, and splits the
   raw payload into per-county JSON files plus an index.
3. **Combined** — `npm run process-data` runs both in sequence.

The data lives in `public/data/`. Each county has its own `*.json` file so
the client only fetches what's near the user.

## Deployment

The site auto-deploys to GitHub Pages via three independent workflows:

| Workflow | Trigger | Job |
| --- | --- | --- |
| `update-data.yml` | Weekly + manual | Sync open data, write `deploy-flag.json` if anything changed |
| `deploy.yml` | Code changes + flag flips | Build, push to `gh-pages` |
| `health-check.yml` | Daily | Probe the live site, alert on regression |

See [`.github/ACTIONS.md`](.github/ACTIONS.md) for the full setup.

### Custom domain

The live build serves from `toilets.littlechin.tw`. The CNAME file in
`public/CNAME` and the `base: '/'` in `vite.config.js` should both be
updated together if you change the domain.

## Project structure

```
where-toilets/
├── public/
│   ├── data/                  # county-split toilet data (generated)
│   ├── favicon.svg / .ico     # icon set
│   ├── apple-touch-icon.png   # iOS home-screen icon
│   ├── icon-192.png / 512.png # PWA / Android icons
│   ├── robots.txt
│   ├── sitemap.xml
│   └── CNAME
├── src/
│   ├── App.vue                # global chrome (navbar, footer, theme tokens)
│   ├── main.js                # router + i18n bootstrap, theme init
│   ├── views/
│   │   ├── Home.vue           # minimal landing page
│   │   ├── Map.vue            # main map + side panel
│   │   └── Settings.vue       # theme / language / about
│   ├── composables/
│   │   ├── useTheme.js        # reactive light / dark / system preference
│   │   └── useGeocoding.js    # Nominatim wrapper
│   ├── utils/
│   │   ├── geo.js             # distance, bounds, county detection
│   │   ├── toilet.js          # has-changing-table heuristic, event params
│   │   ├── theme.js           # storage + apply
│   │   └── analytics.js       # GA4 wrapper
│   └── i18n/
│       ├── index.js
│       └── locales/{zh,en,ja,ko,vi,id,th,fil}/{global,home,map}.js
├── scripts/
│   ├── fetch-toilets.js
│   └── normalize-data.js
└── .github/workflows/
```

## Contributing

Issues and pull requests are welcome. Please open an issue first if you're
planning a larger change, so we can agree on the direction.

For accessibility or contrast bugs especially, screenshots + viewport size
help a lot.

## License

Free for **non-commercial use** under the
[PolyForm Noncommercial License 1.0.0](./LICENSE) — see `LICENSE` for the
full terms.

You are welcome to use, modify, and share this project as long as the
purpose is **non-commercial** (personal projects, education, civic
services, research, internal tools, etc.).

If you want to use any part of this project for **commercial purposes** —
including but not limited to selling a derivative service, embedding it in
a paid product, or using it inside a for-profit business — please contact
[littlechin.tw](https://littlechin.tw) to arrange a separate license.

The toilet data itself is provided by the Ministry of Environment under
their own open data terms; this license does not change those.

## Credits

- Data: [Ministry of Environment, Taiwan](https://data.moenv.gov.tw/)
- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/)
- Geocoding: [Nominatim](https://nominatim.openstreetmap.org/)
- Author: [littlechin.tw](https://littlechin.tw)

---

**Disclaimer:** This is an unofficial tool. Real-world toilet conditions
may differ from the published data. Use at your own discretion.
