# Confirmed domain and email — 30 October 2026

Official email: `contact@drkashmira.com`.
Confirmed custom domain: `www.drkashmira.com`.
Current working site: `https://cuenext.github.io/kashmira/`.

The message promising review comments tomorrow does not supply those comments. This update changes the confirmed contact details and domain preparation only.

## Hosting observed on 30 October

Public DNS and HTTPS checks found:

- `www.drkashmira.com` CNAME → `www.drkashmira.com.cdn.hstgr.net`.
- `drkashmira.com` A → `153.92.12.193` and `88.223.91.56`, with Hostinger IPv6 records as well.
- Both HTTPS variants return Hostinger's default page, titled “Default page”, rather than the doctor's website.
- `https://cuenext.github.io/kashmira/` serves the correct site.

The active `url` in `data/site.json` therefore remains the working Pages address. No active `CNAME` has been added: activating it before a coordinated DNS change could redirect the working Pages site to the placeholder. The confirmed domain is recorded separately from the active URL.

## Coordinated cutover when domain management is available

Follow [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Arrange the following in one change window:

1. Verify domain ownership in the GitHub account, then set the repository Pages custom domain to `www.drkashmira.com` immediately before the DNS change. Keep publishing from **gh-pages / root**. Preserve the `CNAME` commit GitHub creates; its content must be `www.drkashmira.com` only.
2. At the current DNS provider, replace the `www` Hostinger CNAME with a CNAME directly to `cuenext.github.io` (no `https://` and no `/kashmira/`). Remove conflicting `www` website records.
3. For apex-to-www support, replace the Hostinger apex website A records with all four GitHub Pages values: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Remove stale Hostinger apex AAAA records, or replace them with GitHub's values: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
4. Preserve MX, SPF, DKIM, DMARC and mail-related records for the official mailbox. This change concerns website routing only.
5. Confirm authoritative/public DNS reaches GitHub and GitHub's domain check succeeds. Allow certificate provisioning, enable Enforce HTTPS when available, and verify both domain variants and the old Pages URL reach the actual site over valid HTTPS.
6. Change `data/site.json.url` to `https://www.drkashmira.com/`, update `updated`, run `npm run build` and `npm test`, then publish to both source `main` and publishing `gh-pages` while preserving their histories and `CNAME`.
7. Verify root, all English pages, Arabic, nested 404s, schema, social URLs, reciprocal Home/Arabic alternates, robots, sitemap, images and contact drafts. The generator derives the custom-domain 404 base `/` automatically. Keep the official email unchanged.

The build test exercises both origins without altering the deployed configuration. No message is sent by the enquiry form or by its tests; visitors send their prepared draft using their own mail application. Mailbox deliverability is not established by checking a `mailto:` link.
