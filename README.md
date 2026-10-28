# Dr. Kashmira Pawar

Personal pediatric dentistry website. Live: https://cuenext.github.io/kashmira/

Home, About, Cases and Contact are portable static HTML, with local CSS, JavaScript, fonts and optimized WebP photography. Kashmira is the brand. She currently practises at Dr. Munir Silwadi Dental Centre in Abu Dhabi and three Dubai clinics: Dr. Sai Ganesh Medical Centre, Bay Avenue Dental Centre and Hellenic Dental Clinic. No runtime framework, database, analytics, third-party embeds or build server is needed.

The website retains its blue-and-navy personal identity and locally served fonts. Following the doctor's handwritten feedback and the separate Word review supplied by her husband on 28 October 2026, the first screen now foregrounds Dr. Kashmira, with the revised title “Big feelings. Little smiles. A safe space for both.” The previously published About portrait is an interim stand-in for the not-yet-supplied replacement hero photograph. The formerly interactive Star Mission and unexplained Launch rocket button are removed from the home page. Patient-experience and sedation information sections replace the game, with no fabricated reviews or clinical footage.

The English site offers Home, About, Cases and Contact; a focused Arabic information page is available as `arabic.html`, with a language switch. Cases contain 87 existing galleries, newly sortable by treatment or case name. The homepage review area links to public Google search and uses an existing doctor-with-child photograph already selected for the website; it does not claim any review, video, or child-media consent not actually supplied. A nitrous oxide information section explains the doctor's documented training without showing falsely labelled treatment footage. Additional testimonials, parental consents and sedation media must be supplied before these portions can be finished.

## Editing and preview

`scripts/build.mjs` is the source for page content, shared navigation/footer and JSON-LD. Run `npm run build` after editing it. Current practice names, locations, start dates and official links are centralized in `data/practices.json`, reused by the generator, structured data, Contact page and booking selector. Case metadata and descriptive image text are in `data/cases.json`. Home has a compact three-case preview linking to cases.html. The dedicated Cases page contains 87 native galleries: the five supplied Drive galleries and 82 reviewed presentation groups from the complete 107-page Canva portfolio. A visual photo grid starts with twelve cases, with “Show more cases” revealing twelve at a time. Desktop treatment chips, a mobile treatment selector and search narrow the same complete library. Choosing a card opens a native case dialog, with previous/next navigation through the filtered collection; closing it preserves the browse position and returns focus to the case. The nested full-image dialog retains source-supported captions and keyboard navigation. All images remain directly linked and all articles visible without JavaScript. `assets/case-catalog.css` extends the retained `assets/cases.css` for the larger library. The active visual system is `assets/playful.css`, alongside `assets/feedback.css` for the family revisions and the retained decorative Home motion layer `assets/space-interactive.css`, over the retained structural `assets/app.css` and `assets/cases.css`. The prior pink polish layer is preserved but no longer linked. The supplied logo and favicon assets are in `assets/brand/`, with shared branding styles in `assets/brand.css`. About’s portrait and layout refinements are in `assets/about.css`. Navigation, scroll/reveal motion, case sorting and the email appointment inquiry are in `assets/app.js`. Some unused legacy game handlers remain inert without corresponding markup.

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

For an installed Edge browser set `PLAYWRIGHT_CHANNEL=msedge`. Set `SITE_URL` to a trailing-slash URL to verify a deployed copy. The maintained test command covers the booking email-draft behaviour, responsive navigation, clinical gallery interaction, image and internal link audits, a11y and reduced-motion checks, and the new family-feedback checks (`tests/family-feedback.cjs`). Older `tests/playful.cjs` and `tests/space-game.cjs` were retained as historical references but excluded from the default test command because the game was intentionally removed. Accessibility output goes under ignored `test-results/`. The full suite must be rerun in a Node environment before a production release.

## Content and imagery

Professional qualifications, language list, services, contact information and work history are grounded in the supplied 2026 CV. On 21 October 2026 the user relayed the doctor’s confirmation that she works in Abu Dhabi and at three Dubai clinics. This supersedes the 19 October Silwadi-only correction and agrees with the CV’s four current roles: Silwadi since January 2025, Sai Ganesh since January 2026, Bay Avenue since December 2025 and Hellenic since November 2025. The CV marks Silwadi full time and the three Dubai roles part time. Official clinic pages corroborate the locations; visiting days and doctor-specific hours have not been supplied. The older profile says nine years; the newer CV states over eleven. No license number, treatment guarantee, fabricated rating or testimonial is claimed.

See `docs/asset-provenance.md` for photo origins, actual dimensions, crops and checksums. Original repository imagery is retained. The initial Drive inventory held 71 supplied media files and 15 empty case folders. The user subsequently supplied five populated clinical-case folders and asked for galleries. These contain 26 photographs and one video; 16 mouth/appliance close-ups are published across five treatment galleries. Wider facial views, duplicates and the video are held out. The user explicitly chose galleries because no supplied filenames label treatment stages; no before/after order, diagnoses, results or timelines are inferred. Web derivatives preserve framing, use sRGB and contain no EXIF/GPS metadata. Originals and full source inventories stay outside the published repository in the task workspace. No written testimonials are supplied.

The [clinical portfolio](https://canva.link/fthzw69hi5kx71g), supplied through the doctor’s Linktree, was visually reviewed in full. Its 107 pages comprise 89 case-bearing pages and 18 cover, biography, contents or divider pages; they are not 107 patients. The website imports 82 presentation galleries with 505 clinical images and radiographs, retaining the five earlier galleries and 16 photographs for 87 galleries and 521 images in total. Continuation pages stay together; separately presented examples stay separate. Twelve reviewed mouth crops, one omitted nonclinical portrait and two deduplicated continuation images keep the publication focused on clinical views. Exact author frame crops and orientation are preserved, with no generated image edits. See `docs/portfolio-review.md` and `docs/portfolio-assets.json` for the page decisions and derivative inventory. The portfolio’s older biography states eight-plus years and BDS 2016; the newer CV remains the source for the website’s experience and education dates. See `docs/content-sources.md` for provenance and scope.

Google Fonts are served locally under their included SIL Open Font Licenses. Photography and site branding are not licensed for reuse.

## Booking and privacy

The appointment inquiry has an optional first name and a native four-clinic selector. It generates a `mailto:` email draft addressed to the existing public email `drkashmirapawar@gmail.com` (an interim address until she supplies her requested alternative). No personal mobile phone or WhatsApp URL is displayed or embedded in structured data. Sending the email is up to the visitor's installed mail client; the site does not send or store enquiries or confirm an appointment. The form is disabled without its JavaScript enhancement; a direct email link remains available.

The review page links externally to Google's search results; it does not embed, fake, automatically import, or imply verified doctor-specific testimonials. The photograph reused on Home has already been incorporated into the existing site; further patient photographs, especially identifiable minors, and any review videos must have documented permission before publication. Details of missing assets and uncompleted third-party Linktree edits are recorded in `docs/family-feedback-2026-10-28.md`.

## GitHub Pages

Existing deployment: `gh-pages` branch, repository root, HTTPS. New family-review changes are authored on branch `client-family-feedback-2026-10-28` and are not released until explicitly merged/published. Keep `.nojekyll`. Source changes also live on `main`; the publishing branch has its own preserved history. Publish the same verified static files onto `gh-pages` using a normal commit/push, without force-pushing or changing hosting. Only public site files are required; private research assets and CV originals must stay outside the repository.

Check the Pages build is `built` at the published commit, then fetch the live Home/About/Cases/Contact, styles, scripts, fonts, images, robots and sitemap. `404.html` uses the `/kashmira/` base for GitHub Pages.


## Full quality review

The 20 October 2026 editorial and engineering review is recorded in [docs/quality-review.md](docs/quality-review.md). It covers natural-language consistency, source-supported content, all page and gallery flows, responsive navigation, accessibility, motion preferences, progressive enhancement and the GitHub Pages deployment. The design, supplied logo and photographs are retained.
