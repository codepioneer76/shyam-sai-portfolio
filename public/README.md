# public/

Deliberately close to empty.

Every texture, material, sound and font in this project is generated at runtime:

- **textures/** — concrete, metal grain, slot liners, label plates, dossier covers
  and terminal panels are drawn to a `<canvas>` in `src/utils/textures.ts`.
- **audio/** — room tone, electrical hum, latch clacks and typewriter keys are
  synthesised with the Web Audio API in `src/audio/audio.ts`.
- **models/** — the facility, the equipment case, the archive cabinet and every
  prop are built from Three.js primitives in `src/environments` and the zone files.
- **fonts/** — the type stack uses system grotesque + system monospace, so there
  is no webfont request and no flash of unstyled text.

The result: nothing to download, nothing to license, and the app cannot crash on
a missing asset because there are no asset paths to miss.

If you later add real assets (an OG image, a resume PDF), drop them here and
reference them as `/images/og.png`, `/resume.pdf`, and so on.
