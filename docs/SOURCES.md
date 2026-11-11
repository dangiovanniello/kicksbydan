# Asset and product provenance

## Original storefront

https://kicksbydan.netlify.app/

All 12 product names, sizes, conditions, prices, original product photos, the logo, the founder identity, Instagram destination, and email destination were copied from the user's public storefront. The original assets are unchanged in `public/assets`.

The Grinch product is explicitly described by the source as **1:1 Reps**. That distinction is preserved on the feature, inventory card, dialog, and email inquiry. Blanket authentication guarantees from the old page were omitted because they conflict with that listing.

## 360° reference photography

Public StockX product pages and their 36-angle reference sequences were used at the user's direction. Exact source URLs and product-page slugs are retained in `public/rotations/sources.json`. Frames are unchanged JPEG downloads resized by StockX's own image service to 900 px. Reference views illustrate the matching model/colorway, not the condition or authenticity of Dan's pair; original seller photos appear directly under each sequence.

The source filename for the Kobe 6 Dodgers sequence says `Nike-Kobe-8-Protro-Dodgers-PE`, despite its Kobe 6 product page. Visual inspection confirms the blue Kobe 6 silhouette, scales, white swoosh, red heel 8 and tongue details match Dan's photo. The asset is not selected solely by filename.

Ten sequences are available, each containing 36 distinct reference angles. No matching rotation was found for the custom Nike By You Sabrina 1 or the Kobe 4 Milwaukee Bucks pair. Both remain in the full catalog with Dan's actual photographs; no replacement colorway or generic shoe is substituted.

No Sketchfab models, GOAT assets, or generated shoe geometry are used in the finished experience. Spins use actual angle sequences rather than rotating a flat image or claiming these are downloadable 3D scans. No endorsement or affiliation with StockX is claimed.

## Pairs added from Instagram (November 2026)

Four listings were added from @kicks.bydan posts: Jordan 4 UNC, Bape Sk8 Sta Panda Patent, Jordan 1 Lost and Found and Off-White x Nike Dunk Low 'Lot 26 of 50'. Names, sizes, prices, condition and box status are taken from the post captions. Dan's photos (`public/assets/jordan4-unc.jpg`, `bape-sk8-sta-panda.jpg`, `jordan1-lost-and-found.jpg`, `offwhite-dunk-lot26.jpg`) were cropped from screenshots of those posts, so they are lower resolution than the originals; replace them with the original files when convenient.

Their 360° sequences (`public/rotations/13` to `16`) are StockX reference sets for the matching model and colourway, listed in `public/rotations/sources.json`. The StockX page slugs recorded there for these four are inferred from the image set names, not read from the product pages.
