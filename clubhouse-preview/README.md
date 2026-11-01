# R. C. Howard — cinematic clubhouse preview

Build: `clubhouse-preview-2026-11-01-r1`

This is a separate review environment under `clubhouse-preview/`. Production at the repository root and the existing `staging/` tree are not changed by this candidate. All HTML pages are noindex/nofollow. A noindex tag is not authentication: the preview remains publicly reachable by its URL, like the existing stage.

## Included

- New homepage, book destination, Watch, Play, Read, About, listening room, cats, and review desk.
- Existing bonus story bodies preserved, with new reading typography and optional larger text.
- Existing approved Bee-Leaf story/game retained with clubhouse navigation.
- Lost & Found: 1985, an original fictional cassette mystery with local save/resume and an ending.
- Eight Stories, Nine Lives: Chapter One — The … Fruit, a playable adaptation prototype based on the approved Final Campaign Blueprint v1.0 and original manuscript. Daisy remains the Observer; five sensory channels restore Wonder and one Story Seed. Other campaign worlds are not implemented.
- Jumpin' Punkin fixed-step 60 Hz simulation, pause, explicit sound control, and dedicated jump control.
- Cryptogram preserves its exact cipher, adds accessible input labels, hint, saved letters, and an original optional chime.
- Grid Duel arrow-key navigation and opt-in sound.
- Independent namespaced storage for new and retained experiences.

## Media

Existing photographs, cover artwork, music, stories, and audio come from the approved author-site repository. The cover front is framed using CSS; source artwork is not edited. YouTube IDs are retained from the existing site; the latest channel upload list was not independently retrievable. Custom editorial title cards replace unreliable third-party thumbnails. Actual video availability remains controlled by YouTube.

`assets/clubhouse-hero.webp` was created with built-in image generation and converted to WebP for this site. Prompt: original wide cinematic 1980s-inspired writer's basement clubhouse at night, warm amber lamp, teal CRT on the right, wood bookshelves, generic joystick, cassette, blank notebook, cozy armchair, rain on window; left side dark for readable HTML; no people, cats, logos, franchise characters, or lettering.

`assets/clubhouse-welcome.mp3` is an 18-second synthetic male welcome generated using the preset Elias voice through Runway. It is not the author's voice and does not clone him. Complete text appears on the homepage. Music remains “80's Love” by Helkimer and starts only on request.

## Measurement and access

Sitewide analytics is not connected. `review.html` offers an explicitly enabled browser-local test recorder for navigation, outbound Amazon/YouTube clicks, active visible time, and new game progress events. It sends no events to a server. Amazon departures are not purchases; outbound YouTube actions are not subscriptions or likes. No public counter or invented baseline is shown.

## Validation and known limits

Static validation covers all local HTML links/anchors/assets, image alternative text, noindex coverage, and JavaScript syntax. Runner physics is checked at 30/60/90/120/144/165/240 Hz within one fixed simulation tick. Desktop browser checks cover new game completion, reload persistence, hidden pawprint, cryptogram save/resume, runner controls, Grid Duel keyboard navigation, reading size, book framing, Bee-Leaf story artwork/game start, and video iframe creation.

Physical phone/tablet/Fold orientation tests and actual browser zoom remain Chris's UAT before production. Controller navigation is implemented for Chapter One but not verified with physical hardware. Podcast transcripts remain unavailable. Latest YouTube uploads and a production analytics property still need verification/connection.

Production promotion requires Chris's explicit approval of this candidate. Do not overwrite root or existing stage as part of a preview update.

## Lost & Found revision 2

Replaces the abstract four-word puzzle with a cassette rescue: follow the note and BEST arcade score to unlock the drawer, rewind the loose cassette with a pencil, and load/play it. The soundtrack is the existing credited Helkimer track; no new assets or spending.

- `lost-found.html`, `lost-found.css`, `lost-found.js`, and `lost-found-engine.js` are the canonical source for this game.
- Save key: `rch-clubhouse-preview-v1:lost-found-v2`; the previous game's saved state is left intact.
- Hints, an equivalent one-step rewind, and silent completion are available. No timer, dragging, or audio requirement.
- Run progression checks: `node clubhouse-preview/tests/lost-found-engine.test.cjs` from the repository root.
- Revision applies only to `clubhouse-preview/`; production, current staging, and other games remain unchanged.
