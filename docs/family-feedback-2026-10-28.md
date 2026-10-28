# Dr. Kashmira website — family feedback implementation (28 October 2026)

This report keeps the two distinct sources separate. **The handwritten paper is Dr. Kashmira's feedback. The Word document is her husband's review.** Neither document itself contains the replacement hero photo, an alternative contact email, approved Google review quotations, testimonial videos, sedation photos/videos, or written permission to publish additional identifiable children.

## Dr. Kashmira's handwritten checklist

| Request | Implementation | Status |
|---|---|---|
| Change main cover photo | The already published About portrait is used as an interim alternate in the hero; the new requested portrait has not yet been provided. | Interim — awaiting exact photo |
| Check tagline | Replaced with the exact wording from the husband's document: “Big feelings. Little smiles. A safe space for both.” | Implemented |
| Add “Dr. Kashmira” | Adjusted hero portrait label, About headline, navigation, and main prompts. | Implemented |
| Remove phone and add another email | Removed personal phone link from page, schema, and enquiry JS. Emails use the existing public address `drkashmirapawar@gmail.com`, not a fabricated new address. | Interim — awaiting her chosen new email |
| About: additional healthcare needs, autism, ADHD | Included in English About and Care and Arabic content, with individual assessment and support framing. | Implemented |
| Add clinical portfolio to “All my links” | Added an on-site Clinical portfolio link to the footer and About. External Linktree `linktr.ee/dr.Kashmirapawar` cannot be edited from this GitHub repository; its account owner must add the supplied full Canva portfolio `https://canva.link/fthzw69hi5kx71g` or website's cases page there. | Partially implemented — external Linktree pending |
| Arabic for managing patients | Added `arabic.html`, Arabic-English switch, localized clinical information, doctors/clinics, case portfolio link, contact and reviews. | Arabic landing page implemented; detailed English case descriptions not fully translated |
| Photo gallery with patients | Existing 87 clinical treatment galleries remain and are accessible. Homepage patient-experience block displays an already-published photo of Dr. Kashmira with a child. | Expanded children/patient gallery awaits approved, consented assets |
| Sort cases | Added Featured, Case name A–Z, and Treatment type sorting. | Implemented |
| Nitrous oxide sedation photos/videos | Added a factual explanation of nitrous oxide training and assessment, using an existing clinic room as a neutral visual with transparent caption. | Actual sedation footage awaits approved media |
| Reviews | New patient-experience section on Home with an external Google-review search link, existing patient photo, and review-ready layout. | Actual review quotes and testimonial videos await supply/verification/consent |

## Her husband's Word document checklist

| Request | Implementation | Status |
|---|---|---|
| Reviews tab on homepage: Google reviews, children photos, testimonial videos | New Reviews navigation anchor and section; Google search and existing authorised photograph. No unverified Google quote or made-up video. | Structure implemented; real reviews and videos pending |
| Replace homepage landing photograph | Existing About portrait is the temporary alternate. | Awaiting supplied replacement |
| Hero title | Exact title applied. | Implemented |
| Change Call button to contact by email, no displayed number | All personal telephone and WhatsApp links removed; enquiries now open email drafts. | Implemented with existing email pending preferred replacement |
| Kashmira to review care and first-visit sections | Care copy updated for additional healthcare needs, autism and ADHD; first-visit steps revised to the supplied document's wording. | Implemented editorially; her own final medical approval remains necessary |
| What's the use of launch rocket? | Removed both launch action and larger Star Mission from homepage. | Implemented |
| Repetitive arrows | Removed generated decorative arrow symbol from general button helper, and concealed existing redundant icon arrows with CSS. | Implemented |
| Subheading font too small | New global typography scale, stronger small headings, more spacious review/comfort sections. | Implemented |

## Publication safeguards

- Do not invent or import Google ratings, reviews or quotations. A Google search page is **not** proof that the linked reviews mention Dr. Kashmira personally.
- Do not add identifiable patient videos, photos or testimonials without documented permission from the parent/guardian, the practice, and appropriate clinical approval.
- Do not label a generic clinical room image as nitrous oxide administration or imply the service is available at every clinic.
- No public mobile number remains in the website's four main pages, structured data, or new email inquiry JS.
- The email on the site is provisional: `drkashmirapawar@gmail.com`. Swap once the requested email arrives.
- This GitHub change does not modify the third-party Linktree profile or the underlying domain registration/hosting provider.
- The source branch is `client-family-feedback-2026-10-28`. The separate `gh-pages` publishing branch must receive verified site assets for live changes.
- Run `npm ci && npm run build && npm test` and check on desktop/mobile before treating as a complete production release.
