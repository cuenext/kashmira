# Dr. Kashmira Pawar

Personal pediatric dentistry website. Live: https://cuenext.github.io/kashmira/

Home, About and Contact are portable static HTML, with local CSS, JavaScript, fonts and optimized WebP photography. Kashmira is the brand; clinics are practice locations. No runtime framework, database, analytics, third-party embeds or build server is needed.

## Editing and preview

`scripts/build.mjs` is the source for page content, shared navigation/footer and JSON-LD. Run `npm run build` after editing it. Styling is in `assets/app.css`; navigation, scroll/reveal motion and the appointment inquiry are in `assets/app.js`.

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

For an installed Edge browser set `PLAYWRIGHT_CHANNEL=msedge`. Set `SITE_URL` to a trailing-slash URL to verify a deployed copy. Tests cover the real WhatsApp draft (never send), mobile menu/focus, 15 page/breakpoint combinations, imagery, internal links/fragments, canonical/schema data, keyboard FAQ, required booking area, resize behavior, reduced motion, no-JS and interrupted-script fallbacks, and six WCAG A/AA axe scans. Accessibility output is saved in ignored `test-results/`.

## Content and imagery

Professional qualifications, language list, services, contact information and practice locations are grounded in the supplied 2026 CV. The older profile says nine years; the newer CV states over eleven. No license number, external license-register verification, treatment guarantee, fabricated rating or testimonial is claimed.

See `docs/asset-provenance.md` for photo origins, actual dimensions, crops and checksums. Original repository imagery is retained. The full Drive inventory remains in the task workspace outside this published repository: 71 supplied media files; all 15 before/after case folders are empty; no patient publication releases or written testimonials were supplied. Identifiable patient imagery and all three short patient videos are held out of publication. Add cases or media only with appropriate approval and accurate descriptions/captions.

Google Fonts are served locally under their included SIL Open Font Licenses. Photography and site branding are not licensed for reuse.

## Booking and privacy

The inquiry form prepares a WhatsApp message containing the optional parent name and preferred area. It sends nothing automatically, stores nothing on the site and does not confirm an appointment. Phone and email links remain available. Without JavaScript, or if it fails to download, navigation and direct contact links remain usable; enhanced submission starts disabled and controls have no native form names, preventing accidental personal-data query strings.

## GitHub Pages

Existing deployment: `gh-pages` branch, repository root, HTTPS. Keep `.nojekyll`. Source changes also live on `main`; the publishing branch has its own preserved history. Publish the same verified static files onto `gh-pages` using a normal commit/push, without force-pushing or changing hosting. Only public site files are required; private research assets and CV originals must stay outside the repository.

Check the Pages build is `built` at the published commit, then fetch the live Home/About/Contact, styles, scripts, fonts, images, robots and sitemap. `404.html` uses the `/kashmira/` base for GitHub Pages.
