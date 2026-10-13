# Signal Room at `/abtest/`

Self-contained static Three.js game with an old CRT television, VHS signal damage, red/yellow answer buttons, 18 questions, and 8 original ambiguous visual judgment images. Desktop, phone, and tablet layouts and the existing fullscreen, pause, audio, and reduced-motion controls are preserved.

## Hosting

Serve the repository as a static site. The game entry point is `abtest/index.html`; no build command, Node runtime, CDN, or application server is required in production. Use HTTPS, correct JavaScript/CSS/JSON/image/WAV MIME types, and the ordinary same-origin fullscreen permission.

The copied entry includes `<base href="/abtest/">`, so document-relative resources resolve correctly whether the visitor opens `/abtest` or `/abtest/`. A redirect to `/abtest/` is still recommended as the canonical URL. Browser audio starts after the player clicks the start button or presses Enter.

## Runtime package

- `abtest/js/`: 8 application modules; behavior unchanged from the source game.
- `abtest/vendor/three/`: bundled Three.js 0.186.1, required postprocessing modules, and MIT notice.
- `abtest/assets/slides/`: 13 original base slide PNGs.
- `abtest/assets/ambiguity/`: 8 runtime JPEGs, not the larger generation originals.
- `abtest/assets/hardware/`: 2 original button geometry JSON files.
- `abtest/assets/audio/`: 6 active WAV files, including original CRT electronics and channel-change sounds.
- `abtest/runtime-manifest.json`: public file sizes and SHA-256 hashes, question count, runtime version, and license links.

Historical projector audio, original generation PNGs, generation manifests, local source scripts, account identifiers, and QA output are excluded from this public copy. Questions are defined in application modules; no separate question JSON is fetched.

## Attribution

Three.js is MIT licensed; its full notice is preserved at `abtest/vendor/three/LICENSE`. The adapted PowerShot VHS algorithms retain their full MIT notice at `abtest/licenses/powershot-threejs-MIT.txt` and fixed upstream source references at `abtest/open-source-effects.json`. Game questions, environment, slide artwork and layouts, television audio, and buttons are original project content; the eight ambiguous images were generated specifically for this game.

## Verification

Check `/abtest` and `/abtest/`, then start the test and verify the 18-question state, CRT picture, six decoded audio assets, answer buttons, channel switching, pause/resume, fullscreen, and desktop/phone/tablet resizing. There should be no missing static resource requests. To preview locally, serve the repository root using any ordinary static HTTP server and open `/abtest/`.
