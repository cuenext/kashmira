# Confirmed contact and domain update

**Goal:** Publish `contact@drkashmira.com` everywhere and prepare the confirmed `www.drkashmira.com` domain without interrupting the working GitHub Pages site.

**Scope:** The user's 30 October request; additional review comments have not been supplied.

- [x] Inspect latest main and gh-pages, confirm DNS/HTTPS and existing publishing branch.
- [x] Centralize the active site URL, confirmed domain and contact email. Generate Arabic, robots and sitemap from the same settings as English metadata; derive the 404 base from the active URL.
- [x] Update the inquiry recipient, existing recipient assertion and cache version. Verify all clinic/name combinations and no-JS contact links.
- [x] Test generation with both the current Pages URL and the future custom-domain root in isolated fixtures. Run the maintained suite and independent review.
- [ ] Commit source to main, publish verified changes to gh-pages while preserving both histories, and check the deployment plus live pages/links/assets.

DNS finding: both domain variants serve Hostinger's default page. Keep the active Pages URL and omit an active CNAME until an available domain owner can coordinate DNS and GitHub settings. Preserve email DNS records. Record precise cutover steps in `docs/domain-setup.md`.

Verification before publication: full maintained suite passed, including 87 galleries / 521 images, responsive and no-JS checks, accessibility scans, official-recipient form drafts and both generated origins. Independent review identified a hardcoded canonical expectation in the existing audit; fixed it and passed the browser audit with the future domain locally, restored Pages configuration, rebuilt and passed the final full suite. Live checks follow publication.
