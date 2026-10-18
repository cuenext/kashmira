# Kashmira website rework — 19 October 2026

## Design brief
Rework the existing Home, About and Contact pages for parents choosing a pediatric dentist. Dr. Kashmira is the personal brand; practices appear only as locations. Use a premium blue identity, expressive editorial type, real supplied photography, child-friendly line details, generous space and purposeful motion. Use dryasmin.ae as a content/interaction reference, never a visual or copy template.

Keep the portable static HTML/CSS/JS architecture, URL paths, existing assets and GitHub Pages deployment from gh-pages. Preserve useful canonical/social metadata and rebuild accurate linked schema. No fabricated testimonials, outcomes, statistics or booking confirmations. No case or identifiable patient publication without supporting approval. No backend or data collection is needed: booking connects to verified direct contact channels.

## Implementation sequence
- [x] Audit source, CV, Drive inventory and reference site. Retain originals and record provenance outside the published tree.
- [x] Write navigation/booking browser acceptance checks and verify that the new appointment request flow is initially absent.
- [x] Rebuild three pages and shared design: accessible navigation; responsive photo-led layouts; concern-led care; CV timeline; supported photo/media content; native FAQ; real practice locations; appointment inquiry via WhatsApp with phone/email alternatives.
- [x] Implement reveal choreography, scroll progress, subtle line animation and interactive care details; respect reduced motion and expose all content without JS.
- [x] Optimize supplied imagery to responsive WebP, set intrinsic dimensions, eager-load only hero; lazy-load other imagery and avoid third-party video/social embeds.
- [x] Verify internal files/fragments, external destinations, metadata/schema, keyboard navigation, menu Escape/focus, FAQ, booking validation, no-JS content, reduced motion, desktop/tablet/mobile widths and real deployment.
- [x] Independent final review, fix material issues, commit and fast-forward published branch after preserving its existing branch history.

## Review focus
Mobile navigation must remain usable at 320px, and desktop resizing must reset hidden/inert states. Booking must open a message draft without claiming an appointment is confirmed. Reduced-motion mode and script failure must never hide content. Contact details and CV assertions require supplied evidence. Patient assets and private CV data must stay out of deployment.

## Progress
Repository baseline: main 4eb00b2; gh-pages afc6bdf. Clean fresh clone. Existing JS included twice per page, and reveal styles concealed content when JS failed. No test framework/build step existed.

Verification: acceptance checks cover appointment drafts, mobile menu Escape/focus and 15 page/breakpoints. Audit covers image loading, links, schema, keyboard FAQ, required area, resize, reduced motion, no-JS and six WCAG A/AA axe scans. Independent review identified interrupted-script navigation/GET privacy and label-in-name issues; all fixed with regression coverage. Publication and live verification are recorded in the final handoff.
