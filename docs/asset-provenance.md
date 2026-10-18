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
| assets/photos/social.webp | 1200 x 630 | 43,644 | website/assets/doctors/dr-kashmira-pawar-jayprakash.webp | Professional source portrait crop, 504 x 630 on designed canvas; text is drawn, no generated image. |

## Source details

- portrait and social: retained repository file assets/doctors/dr-kashmira-pawar-jayprakash.webp, 720 x 720. Adult-only professional portrait in blue scrubs with blue clinical background.
- personal: cv-image-0-Image44.jpg, 383 x 488 professional headshot extracted unchanged from supplied local source Dr. Kashmira_Specialist Pediatric Dentist_CV_2K26_.pdf. Cropped to 380 x 475 without upscaling. The earlier supplied colourful-scrub selfie IMG_4865.JPG remains in the private research inventory and is no longer used for this asset.
- journal: IMG_4165.JPG, Google Drive ID 1GoGpFAnTw3GwV7aOwWqcaBD6lBwSCchD, same supplied folder. Adult-only mirror portrait in yellow bee scrubs, source 1242 x 2208.
- social.webp: simple 1200 x 630 social card using the retained professional portrait, blue background, and source-supported name, title, Dubai/Abu Dhabi geography. Text uses locally available Georgia and Arial fonts and is rasterized.

No patient/minor media was included. The user's website request supports use of these doctor-only supplied images; no separate patient consent is inferred from the Drive folder. Complete source inventory remains outside the repository in ../research-assets/inventory.md.

## SHA-256 checksums

- portrait-480.webp: c63a866ddd3706097d32cd7e646ba53025da3308d87b229b41c42ea721e2f5c9
- portrait-960.webp: a972231d300f6b0273ec5a1f9253a03c16f8bb71721ceed7f3f2ff1a25c58d63
- personal-480.webp: 8c8fe9bdc4bb26246ad7d2384b4406abd1f4fff758a133205cd8cbbba4cedae1
- personal-960.webp: 8c8fe9bdc4bb26246ad7d2384b4406abd1f4fff758a133205cd8cbbba4cedae1
- journal-480.webp: 37d63aff4b660a84164b0746d27713f967d0c07c2e29b3bb3aadd1de4bdcd837
- journal-960.webp: 64a7dab0e815f06281450e1da9ab61b375320c30bb3c31fef3325b40119fe4f1
- social.webp: 54a3b70c4cd1648ed09702eeb3b6ce698edb54cc9bc29639cb058ceb03bf547c
