# Photo asset provenance

Created 19 October 2026 from retained and user-supplied assets. Original files were preserved. Only crops, resizing, WebP compression, EXIF orientation normalization and metadata removal were applied. No facial retouching or generated image content was used.

The responsive photos are 4:5. Filenames identify the requested size slot. The retained 720 x 720 professional hero portrait is cropped to 576 x 720 for its larger slot; it is deliberately not upscaled. The About portrait uses a 380 x 475 crop from the supplied 383 x 488 CV headshot; both size slots preserve that native crop without enlargement. All image files were reopened and verified.

| Output | Actual dimensions | Bytes | Source | Crop box in oriented source pixels |
|---|---|---:|---|---|
| assets/photos/portrait-480.webp | 480 x 600 | 24,170 | website/assets/doctors/dr-kashmira-pawar-jayprakash.webp | (72, 0, 648, 720) |
| assets/photos/portrait-960.webp | 576 x 720 | 31,778 | website/assets/doctors/dr-kashmira-pawar-jayprakash.webp | (72, 0, 648, 720) |
| assets/photos/personal-480.webp | 380 x 475 | 20,872 | research-assets/cv-image-0-Image44.jpg | (1, 4, 381, 479) |
| assets/photos/personal-960.webp | 380 x 475 | 20,872 | research-assets/cv-image-0-Image44.jpg | (1, 4, 381, 479) |
| assets/photos/journal-480.webp | 480 x 600 | 40,844 | research-assets/1GoGpFAnTw3GwV7aOwWqcaBD6lBwSCchD__IMG_4165.JPG | (0, 250, 1242, 1802) |
| assets/photos/journal-960.webp | 960 x 1200 | 126,962 | research-assets/1GoGpFAnTw3GwV7aOwWqcaBD6lBwSCchD__IMG_4165.JPG | (0, 250, 1242, 1802) |
| assets/photos/social.webp | 1200 x 630 | 43,156 | website/assets/doctors/dr-kashmira-pawar-jayprakash.webp | Professional source portrait crop, 504 x 630 on pink designed canvas; text is drawn, no generated image. |

## Source details

- portrait and social: retained repository file assets/doctors/dr-kashmira-pawar-jayprakash.webp, 720 x 720. Adult-only professional portrait in blue scrubs with blue clinical background.
- personal: cv-image-0-Image44.jpg, 383 x 488 professional headshot extracted unchanged from supplied local source Dr. Kashmira_Specialist Pediatric Dentist_CV_2K26_.pdf. Cropped to 380 x 475 without upscaling. The earlier supplied colourful-scrub selfie IMG_4865.JPG remains in the private research inventory and is no longer used for this asset.
- journal: IMG_4165.JPG, Google Drive ID 1GoGpFAnTw3GwV7aOwWqcaBD6lBwSCchD, same supplied folder. Adult-only mirror portrait in yellow bee scrubs, source 1242 x 2208.
- social.webp (archived, no longer referenced by any page): simple 1200 x 630 social card using the retained professional portrait, pink paper (#fff7fa), rose text (#6b2c4d) and accent (#a23f70), and source-supported name, title, Dubai/Abu Dhabi geography. Text uses locally available Georgia and Arial fonts and is rasterized. The portrait retains its natural colours without a filter.

The initial rework included no patient/minor media; the later case-gallery addition is documented below. The user's website request supports use of these doctor-only supplied images; no separate patient consent is inferred from the Drive folder. Complete source inventory remains outside the repository in ../research-assets/inventory.md.

## SHA-256 checksums

- portrait-480.webp: c63a866ddd3706097d32cd7e646ba53025da3308d87b229b41c42ea721e2f5c9
- portrait-960.webp: a972231d300f6b0273ec5a1f9253a03c16f8bb71721ceed7f3f2ff1a25c58d63
- personal-480.webp: 8c8fe9bdc4bb26246ad7d2384b4406abd1f4fff758a133205cd8cbbba4cedae1
- personal-960.webp: 8c8fe9bdc4bb26246ad7d2384b4406abd1f4fff758a133205cd8cbbba4cedae1
- journal-480.webp: 37d63aff4b660a84164b0746d27713f967d0c07c2e29b3bb3aadd1de4bdcd837
- journal-960.webp: 64a7dab0e815f06281450e1da9ab61b375320c30bb3c31fef3325b40119fe4f1
- social.webp: 2015731af31227867e77a978088b1f2ec4e14a282c4de35a364a07e14e31b883

## Original decorative vectors

The four small line illustrations in assets/doodles/ (daisy.svg, cloud.svg, butterfly.svg and smile.svg) were drawn for this site in SVG code. They use the pink identity and contain no external references, fonts, text, photographs or embedded animation. They are decorative and hidden from assistive technology. Motion is controlled by the site so pause/reduced-motion preferences apply to all four.

## Clinical case galleries

The user supplied five populated case-folder links on 19 October 2026 for the website and explicitly chose photo galleries without before/after labels. All 26 photographs and one video were inventoried and visually inspected; 16 close-up photographs were selected. No clinical stages, outcomes or patient details were inferred. Neutral alt text describes visible views. The video and wider facial images remain unpublished.

| Gallery | Supplied folder | Published original filenames, in display order |
|---|---|---|
| Groper’s appliance · anterior space maintainer | 1WZcNqSquBczd2OlLFO7njV25o2Xu7Iga | IMG_3133, IMG_3131, IMG_3751, IMG_3754 |
| Nance palatal appliance | 168U_vdjrK_k9Xhe_fu12nzzQvEYh8dAj | IMG_3315, IMG_3136 |
| Zirconia crown | 1Itq3e6HYIU0yLxozFbTpQxPE4pDWRaWR | IMG_1689, IMG_1690 |
| Preformed band and loop space maintainer | 1k5LtApLeLDq6nDmNwtnrV1WLVM1_8QO3 | IMG_5246, IMG_5239, IMG_4338, IMG_4343 |
| Custom-made band and loop retainers | 1NitVbY3xz4lZWAdDbCrRICr7c5C3Sl7R | IMG_8131, IMG_8126, IMG_8134, IMG_8127 |

The source folder misspellings were normalized in display titles. Display order is representative photography, not treatment chronology. Photos retain their original framing and geometry, without cropping, generative edits or retouching. Original Display P3 pixels were converted to sRGB before WebP encoding. Each image has a 480-pixel-wide derivative and a maximum-1440-pixel derivative, with no upscaling. Actual dimensions are stored in data/cases.json. All 32 outputs total 1,556,616 bytes. Every output was checked for zero EXIF and absence of EXIF, XMP and ICCP RIFF chunks. Original HEICs, GPS data, capture dates and the full inventories stay outside the repository under ../case-research/.

The image viewer uses contain sizing so all clinical content remains visible. Images are lazy-loaded and remain ordinary links without JavaScript. Clinical photographs receive no decorative overlays other than the unobtrusive viewer control.

Following the user’s current-practice correction, Open Graph and Twitter metadata now use the unchanged professional portrait (assets/photos/portrait-960.webp) with neutral doctor-name alt text. The archived social.webp with former Dubai/Abu Dhabi geography is retained for history and is no longer used in the site.

## Space identity · 20 October 2026

The user requested a more colorful pediatric design, then chose a unique space theme inspired by drverwest.com’s immersive underwater design. All ten files in assets/play/ are original code-drawn SVGs: tooth-friend, rainbow, sun, rocket, flower, planet, brush, tooth-astronaut, moon and constellations. They are self-contained, use no external images, scripts or embedded animation, and are decorative. Main art was rendered and visually inspected before use. The original pink doodles remain preserved but are no longer referenced by the active pages or smile particles.

No doctor or case photograph was edited for the space redesign. Only surrounding layout, typography and graphic framing changed. Baloo 2 and Nunito Latin variable WOFF2 fonts are served locally from assets/fonts/ with their SIL Open Font License text (Baloo2-OFL.txt and Nunito-OFL.txt). Fonts came from the official Google Fonts distribution.
