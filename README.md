# Dr. Kashmira Pawar

Personal pediatric dentistry website. Live: https://cuenext.github.io/kashmira/

Home, About and Contact are portable static HTML, with local CSS, JavaScript, fonts and optimized WebP photography. Kashmira is the brand; clinics are practice locations. No runtime framework, database, analytics, third-party embeds or build server is needed.

The pink illustrated design adds original smiling flower/cloud/butterfly doodles, paper-like photo frames, scalloped edges and drawn accents. The assets/polish.css layer styles these details; assets/app.js handles the smile burst, native accordion enhancement and motion controls. Continuous motion runs only while decorations are visible, can be paused globally and is disabled for system reduced-motion preferences. A pause preference is kept for the current browser tab session.

## Editing and preview

`scripts/build.mjs` is the source for page content, shared navigation/footer and JSON-LD. Run `npm run build` after editing it. Case metadata and descriptive image text are in `data/cases.json`. The Home gallery is progressively enhanced into treatment tabs and an accessible native photo dialog; all photos remain linked and all galleries visible without JavaScript. Gallery styles are in `assets/cases.css`. Styling is in `assets/app.css`; navigation, scroll/reveal motion and the appointment inquiry are in `assets/app.js`.

```sh
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:4173/. The preview binds to localhost only.

## Verification

In a second terminal while preview runs:

```sh
npx playwright install chromium
npm test
```

For an installed Edge browser set `PLAYWRIGHT_CHANNEL=msedge`. Set `SITE_URL` to a trailing-slash URL to verify a deployed copy. Tests cover the real WhatsApp draft (never send), mobile menu/focus, 15 page/breakpoint combinations, imagery, internal links/fragments, canonical/schema data, keyboard FAQ, required booking area, resize behavior, reduced motion, no-JS and interrupted-script fallbacks, and six WCAG A/AA axe scans. Case checks open all 16 published photos, test treatment tabs and direct case links, dialog navigation/focus, four viewport widths, no-JS galleries, reduced motion and three additional accessibility scans. Motion checks cover smile feedback, capped particle cleanup, actual visible doodle motion, global pause, session preference across navigation and accordion height cleanup. Accessibility output is saved in ignored `test-results/`.

## Content and imagery

Professional qualifications, language list, services, contact information and practice locations are grounded in the supplied 2026 CV. The older profile says nine years; the newer CV states over eleven. No license number, external license-register verification, treatment guarantee, fabricated rating or testimonial is claimed.

See `docs/asset-provenance.md` for photo origins, actual dimensions, crops and checksums. Original repository imagery is retained. The initial Drive inventory held 71 supplied media files and 15 empty case folders. The user subsequently supplied five populated clinical-case folders and asked for galleries. These contain 26 photographs and one video; 16 mouth/appliance close-ups are published across five treatment galleries. Wider facial views, duplicates and the video are held out. The user explicitly chose galleries because no supplied filenames label treatment stages; no before/after order, diagnoses, results or timelines are inferred. Web derivatives preserve framing, use sRGB and contain no EXIF/GPS metadata. Originals and full source inventories stay outside the published repository in the task workspace. No written testimonials are supplied.

Google Fonts are served locally under their included SIL Open Font Licenses. Photography and site branding are not licensed for reuse.

## Booking and privacy

The inquiry form prepares a WhatsApp message containing the optional parent name and preferred area. It sends nothing automatically, stores nothing on the site and does not confirm an appointment. Phone and email links remain available. Without JavaScript, or if it fails to download, navigation and direct contact links remain usable; enhanced submission starts disabled and controls have no native form names, preventing accidental personal-data query strings.

## GitHub Pages

Existing deployment: `gh-pages` branch, repository root, HTTPS. Keep `.nojekyll`. Source changes also live on `main`; the publishing branch has its own preserved history. Publish the same verified static files onto `gh-pages` using a normal commit/push, without force-pushing or changing hosting. Only public site files are required; private research assets and CV originals must stay outside the repository.

Check the Pages build is `built` at the published commit, then fetch the live Home/About/Contact, styles, scripts, fonts, images, robots and sitemap. `404.html` uses the `/kashmira/` base for GitHub Pages.
