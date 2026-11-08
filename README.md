# Kicks by Dan — The rotation

A motion storefront rebuilt from the live Kicks by Dan site. The exact original logo opens in a short cinematic reveal. Scrolling rotates matching shoe/colorway turntables through real source angles, transitions to the next shoe, and shows Dan's actual pair photograph underneath.

## Run and deploy

```sh
npm ci
npm run dev -- --port 5174
npm run build
```

With the development server running, `npx playwright test` runs browser checks using `/usr/bin/chromium`. No WebGL or third-party runtime services are needed. Fonts and all photography are bundled locally.

For Netlify, connect this repository, build with `npm run build`, and publish `dist`. `netlify.toml` sets these values. An inquiry form named `trade-inquiry` is statically declared in `index.html` for Netlify Forms detection. Confirm form detection is enabled in Netlify after deployment. The client checks HTTP success and retains the entered details on failure. Local previews do not send inquiries. Instagram and product-specific mailto links preserve the original direct ordering flow. No payments or stock reservations are taken on site.

## Content and motion

- `src/catalog.js`: all 12 original listings and contact information.
- `src/data.js`: the 10 featured rotations and matching inventory IDs.
- `public/assets`: Dan's actual original photographs and logo.
- `public/rotations`: 36 JPEG reference angles per matching product.
- `src/scene.js`: canvas turntable rendering, scroll-synchronized frame selection and transitions, manual rotation, lazy loading, and bounded image caching.
- `src/catalog-ui.js`: searchable/filterable/sortable stock, accessible dialogs, product inquiries, and buy/sell/trade form.
- `docs/SOURCES.md`: image provenance and limitations.

Reduced motion skips the opening reveal and uses a stable source angle while retaining navigation, product photos, and inquiries. The full inventory can be reached immediately through the header so visitors need not scroll through every feature.

The custom Sabrina 1 and Kobe 4 Milwaukee Bucks retain their actual photos in the catalog, but no unverified rotation is substituted. The Grinch is clearly labeled **1:1 replicas**, including when reference photography depicts the authentic colorway. Source inventory may change; confirm availability directly with Dan.

Publishing code to GitHub does not update the existing Netlify deployment unless that Netlify project is connected to this repository/branch. Live form delivery and the Netlify deployment must be checked after hosting is connected.
