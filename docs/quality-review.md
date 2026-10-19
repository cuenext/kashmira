# Website quality review

Reviewed 20 October 2026 for the requested final editorial and software-engineering polish.

## Editorial assessment

My overall wording rating is **7/10 before and 9/10 after**. This is an editorial judgement, not a measured score. The original had warmth and a clear personality, but repeated “little,” “familiar” and indirect phrases such as “find your next visit.” Some section headings said less than their size suggested, and the FAQs changed between first and third person.

The review covered Home, About, Contact/Booking, all five Cases galleries and the 404 page. It included expanded care descriptions and FAQs, navigation, captions, alternative text, form states, accessible labels, game instructions and announcements, titles, search descriptions and shared social metadata. Two separate editorial passes checked the final copy.

Examples of the changes:

| Before | After |
|---|---|
| Care for every little chapter. | Dental care, as they grow. |
| Let’s find your next visit | Arrange a visit |
| The places behind the experience. | Where I’ve worked. |
| A conversation, on your terms. | How your details are used |
| Your appointment is confirmed only after you hear back. | Your visit is booked once a date and time have been confirmed. |

The doctor’s voice is now consistently first person. Services are described plainly, and the appointment form explains what it actually does. Privacy wording refers specifically to the appointment request; it does not imply that the animation preference cannot be saved for the tab session. Clinical photo descriptions remain factual and avoid inferred diagnoses, materials or treatment stages. Treatment names retain the supplied terminology, with grammatical hyphenation only.

The main “Big feelings. Little smiles. I’m here for both.” headline, the space game, real photographs and supplied logo are retained. Playful language is concentrated in the children’s area. Qualifications, experience, education, languages and the sole current Silwadi practice remain grounded in the supplied sources and user corrections. No new testimonials, outcomes or clinical promises were added.

## Engineering findings and fixes

1. **Landscape navigation:** at 640 × 320, the open mobile menu extended below the viewport, hiding Contact and Booking. The enhanced menu now fits the available height and scrolls vertically. A regression check reaches the final booking link by keyboard.
2. **Keyboard navigation:** an open menu could remain over the page after focus moved out of the header. It now closes when focus leaves the header, so the next control is not covered.
3. **Mobile case selection:** opening a direct case link, or moving a selected desktop case to a phone-sized viewport, could leave the active tab outside the horizontal strip. The selected tab now stays visible after selection, resizing and font loading, without scrolling the page vertically.
4. **Preview-server reliability:** a decoded null byte in a URL could stop the local preview process. Invalid requests now receive a controlled response. An isolated child-server test checks malformed requests, traversal protection, subsequent availability, content types and cache behaviour. GitHub Pages does not run this server.

Each defect had a reproducible failing check before its fix. Regression checks are part of the normal test command. No framework, dependency or tracking service was added.

## Verification

The final build and all eight test suites passed. They cover the optional-name WhatsApp draft without sending it, navigation and keyboard focus, 20 main page/breakpoint combinations, image decoding, internal links and fragments, current-practice copy and schema, all 16 clinical photographs, gallery tabs and dialog controls, keyboard and touch game completion/replay, motion preferences, animation cleanup, and no-JavaScript/interrupted-script fallbacks.

Fourteen accessibility scans are included in the main suite; two additional scans checked the branded 404 page. All reported zero WCAG A/AA violations in the tested states. Screenshots were inspected across 320, 390, 768 and 1440 pixel layouts, with additional main-page checks at 1024 pixels and a 640 × 320 landscape navigation regression. An intermediate-width sweep found no header overlap or horizontal overflow.

The nested GitHub Pages 404 base, branding and recovery links were checked. External clinic, Maps, Instagram, WhatsApp and Linktree destinations responded successfully; no message was sent. The existing ambulance number was rechecked against [UAE Government emergency guidance](https://u.ae/en/information-and-services/justice-safety-and-the-law/handling-emergencies). Source qualifications and contact details were checked against the supplied material, rather than treated as a new regulatory or account-ownership verification.

Browser automation used Microsoft Edge on Windows, with desktop, touch, keyboard and reduced-motion contexts. Accessibility automation supplements the manual wording, layout and keyboard review. Final publishing is checked against the exact GitHub Pages commit and live file contents.
