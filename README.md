# Kicks by Dan

Sneaker storefront for Kicks by Dan. Black, white and the logo blue, with a liquid glass logo intro, a scroll-driven 360° stage for the featured pairs, and the full list of pairs underneath.

## Run and deploy

```sh
npm ci
npm run dev -- --port 5174
npm run build
```

`npx playwright test` runs the browser checks (it starts the dev server itself). Set `CHROMIUM_PATH` to use a system Chromium.

The site is a static Vite build (`dist`), so it deploys as is on Vercel or Netlify. The sell / trade form posts to Netlify Forms when hosted on Netlify; on any other host it opens a pre-filled email to Dan instead. No payments are taken on site.

## Where things live

- `index.html`: all page markup.
- `src/catalog.js`: all listings and contact details. Edit this to change stock.
- `src/data.js`: which listings have a 360° sequence.
- `src/intro.js`: the logo intro. It plays the liquid glass reveal in `src/glass-reveal.js` on `public/logo/mark.webp` (the logo on a transparent background), then flies the logo into the header.
- `src/stage.js`: the pinned 360° stage (canvas turntable, scroll and drag to turn).
- `src/catalog-ui.js`: pairs grid, product dialog, sell / trade form.
- `src/motion.js`, `src/scroll.js`: smooth scrolling, reveals, header, marquee.
- `src/style.css`: all styles. Colours are the variables at the top.
- `public/assets`: Dan's own photos and the original logo.
- `public/rotations`: 36 reference angles per featured model. See `docs/SOURCES.md`.

With reduced motion turned on in the OS, the intro and scroll effects are skipped and everything is simply shown.

The Kobe 6 Grinch listing is a 1:1 replica and is labelled as such on the stage, its card and its dialog.
