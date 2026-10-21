# Dr. Kashmira Pawar

Personal pediatric dentistry website. Live: https://cuenext.github.io/kashmira/

Home, About, Cases and Contact are portable static HTML, with local CSS, JavaScript, fonts and optimized WebP photography. Kashmira is the brand. She currently practises at Dr. Munir Silwadi Dental Centre in Abu Dhabi and three Dubai clinics: Dr. Sai Ganesh Medical Centre, Bay Avenue Dental Centre and Hellenic Dental Clinic. No runtime framework, database, analytics, third-party embeds or build server is needed.

The space identity uses deep navy, sky blue, pink, lilac and cool white, with locally served Baloo 2 and Nunito fonts. Original SVG stars, a tooth astronaut, moon, planets and rockets create a playful pediatric setting around real doctor photographs. Home follows care → first visit → meet Kashmira → case preview → Little Explorers → FAQs, with a numbered jump menu. The personal Instagram photograph lives on About. Clinical case photos retain neutral framing and their original geometry.

Children can pick a tooth, rainbow or rocket co-pilot and request a decorative smile burst. Star Mission is an untimed six-star game: tap targets or use Tab/Enter and arrow keys to fly the rocket, collect each star once, earn a Little Explorer badge and replay. Floating planets and a cruising rocket add bounded ambient movement, with an explicit Launch rocket action. The mobile game scrolls into view when started; its score and replay action are available on the board. These controls run locally and send no data. Continuous motion runs only while illustrations are visible, can be paused globally and is disabled by system reduced-motion preferences. A pause preference is kept for the browser tab session.

## Editing and preview

`scripts/build.mjs` is the source for page content, shared navigation/footer and JSON-LD. Run `npm run build` after editing it. Current practice names, locations, start dates and official links are centralized in `data/practices.json`, reused by the generator, structured data, Contact page and booking selector. Case metadata and descriptive image text are in `data/cases.json`. Home has a compact three-case preview linking to cases.html. The dedicated Cases page contains 87 native galleries: the five supplied Drive galleries and 82 reviewed presentation groups from the complete 107-page Canva portfolio. Eleven treatment filters and case search narrow a bounded vertical index. The accessible image dialog retains source-supported captions; all images remain directly linked and all articles visible without JavaScript. `assets/case-catalog.css` extends the retained `assets/cases.css` for the larger library. The active visual system is `assets/playful.css`, with Home’s bounded motion/game rules in `assets/space-interactive.css`, over the retained structural `assets/app.css` and `assets/cases.css`. The prior pink polish layer is preserved but no longer linked. The supplied logo and favicon assets are in `assets/brand/`, with shared branding styles in `assets/brand.css`. About’s portrait and layout refinements are in `assets/about.css`. Navigation, the co-pilot chooser, scroll/reveal motion and the appointment inquiry are in `assets/app.js`.

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

For an installed Edge browser set `PLAYWRIGHT_CHANNEL=msedge`. Set `SITE_URL` to a trailing-slash URL to verify a deployed copy. Tests cover malformed preview requests without process failure, the real WhatsApp draft (never send), mobile menu/focus including short landscape viewports and keyboard focus leaving the header, 20 page/breakpoint combinations, imagery, internal links/fragments, canonical/schema data, keyboard FAQ, current-practice content, resize behavior, reduced motion, no-JS and interrupted-script fallbacks, and eight WCAG A/AA axe scans. Case checks compare all 87 galleries and all 107 source-page decisions against an independently curated fixture, decode every full image and thumbnail, and cover combined category/search filters, empty/reset states, visible-result keyboard navigation, deep links, captions, modal focus, single-image controls, mobile scrolling, four viewport widths, no-JS galleries, reduced motion and three additional accessibility scans. Motion checks cover smile feedback, capped particle cleanup, actual visible doodle motion, global pause, session preference across navigation and accordion height cleanup. The space-game checks cover keyboard/touch collection, duplicate-input safety, replay focus, 44px targets at four widths, launch feedback, visible-only decorative motion, quiet modes, no-JS and three further accessibility scans. The play checks cover keyboard co-pilot selection, readable status feedback, one active choice, mobile fit, global pause, reduced motion and no-JS artwork. Accessibility output is saved in ignored `test-results/`.

## Content and imagery

Professional qualifications, language list, services, contact information and work history are grounded in the supplied 2026 CV. On 21 October 2026 the user relayed the doctor’s confirmation that she works in Abu Dhabi and at three Dubai clinics. This supersedes the 19 October Silwadi-only correction and agrees with the CV’s four current roles: Silwadi since January 2025, Sai Ganesh since January 2026, Bay Avenue since December 2025 and Hellenic since November 2025. The CV marks Silwadi full time and the three Dubai roles part time. Official clinic pages corroborate the locations; visiting days and doctor-specific hours have not been supplied. The older profile says nine years; the newer CV states over eleven. No license number, treatment guarantee, fabricated rating or testimonial is claimed.

See `docs/asset-provenance.md` for photo origins, actual dimensions, crops and checksums. Original repository imagery is retained. The initial Drive inventory held 71 supplied media files and 15 empty case folders. The user subsequently supplied five populated clinical-case folders and asked for galleries. These contain 26 photographs and one video; 16 mouth/appliance close-ups are published across five treatment galleries. Wider facial views, duplicates and the video are held out. The user explicitly chose galleries because no supplied filenames label treatment stages; no before/after order, diagnoses, results or timelines are inferred. Web derivatives preserve framing, use sRGB and contain no EXIF/GPS metadata. Originals and full source inventories stay outside the published repository in the task workspace. No written testimonials are supplied.

The [clinical portfolio](https://canva.link/fthzw69hi5kx71g), supplied through the doctor’s Linktree, was visually reviewed in full. Its 107 pages comprise 89 case-bearing pages and 18 cover, biography, contents or divider pages; they are not 107 patients. The website imports 82 presentation galleries with 505 clinical images and radiographs, retaining the five earlier galleries and 16 photographs for 87 galleries and 521 images in total. Continuation pages stay together; separately presented examples stay separate. Twelve reviewed mouth crops, one omitted nonclinical portrait and two deduplicated continuation images keep the publication focused on clinical views. Exact author frame crops and orientation are preserved, with no generated image edits. See `docs/portfolio-review.md` and `docs/portfolio-assets.json` for the page decisions and derivative inventory. The portfolio’s older biography states eight-plus years and BDS 2016; the newer CV remains the source for the website’s experience and education dates. See `docs/content-sources.md` for provenance and scope.

Google Fonts are served locally under their included SIL Open Font Licenses. Photography and site branding are not licensed for reuse.

## Booking and privacy

The inquiry form accepts an optional parent name and a native practice selector (`#booking-location`). “Help me choose” is the default empty value; the clinic values are `silwadi`, `sai-ganesh`, `bay-avenue` and `hellenic`. A selected clinic adds its name and address to a WhatsApp draft addressed to the doctor’s existing contact number. The default draft asks about availability in Abu Dhabi or Dubai. The site sends nothing automatically, stores no appointment request and does not confirm an appointment; the doctor must confirm the location, date and time. Phone and email links remain available. Without JavaScript, or if it fails to download, navigation and direct contact links remain usable; enhanced submission starts disabled and controls have no native form names, preventing accidental personal-data query strings.

## GitHub Pages

Existing deployment: `gh-pages` branch, repository root, HTTPS. Keep `.nojekyll`. Source changes also live on `main`; the publishing branch has its own preserved history. Publish the same verified static files onto `gh-pages` using a normal commit/push, without force-pushing or changing hosting. Only public site files are required; private research assets and CV originals must stay outside the repository.

Check the Pages build is `built` at the published commit, then fetch the live Home/About/Cases/Contact, styles, scripts, fonts, images, robots and sitemap. `404.html` uses the `/kashmira/` base for GitHub Pages.


## Full quality review

The 20 October 2026 editorial and engineering review is recorded in [docs/quality-review.md](docs/quality-review.md). It covers natural-language consistency, source-supported content, all page and gallery flows, responsive navigation, accessibility, motion preferences, progressive enhancement and the GitHub Pages deployment. The design, supplied logo and photographs are retained.
