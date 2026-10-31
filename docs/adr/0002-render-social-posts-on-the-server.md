# Render Social Posts on the server

Content Studio draws Social Posts on the server with `next/og` (Satori): Vacancy Templates are JSX over an optional designed background image, returned as PNG. Content Editors work on both phones and desktops, and the published image must be identical regardless of device; browser-side HTML-to-image capture renders fonts and emoji differently on iOS Safari, Android Chrome and desktop.

## Considered Options

- **Browser-side HTML-to-image capture**: rejected. Output depends on the device, and it is slow for 1080×1920 images on phones.
- **Server-side canvas drawing over a PNG template (`@napi-rs/canvas`)**: rejected. Text must be positioned and wrapped by hand, which is fragile for Georgian copy of varying length.

## Consequences

Vacancy Templates are limited to the CSS subset Satori supports (flexbox, no grid). Fonts must be loaded explicitly, since there is no system font fallback. Manrope (the Lazari Ways brand font) has no Georgian glyphs, so it is paired with Noto Sans Georgian.
