# 文化程度检定 — /abtest2/

Standalone static Three.js game built from the existing /abtest CRT room. Sixteen actual, attributed Xu Bing Square Word Calligraphy excerpts are shown with two English interpretations and Chinese glosses. Red A/Q, yellow B/E; each question has 12/10/8 seconds after the CRT channel-change animation. Mechanical tick/tock accelerates to a half-second cadence in the last three seconds. Feedback lasts 1.8 seconds, timeouts auto-advance, and final results include accuracy, response time and a per-question review.

Start unlocks Web Audio from a user gesture. Pause and hidden-tab transitions freeze the timer and mute the audio. Settings retain mute, volume, reduced motion and analog intensity. Desktop fullscreen and phone/tablet layouts are inherited from /abtest. The tabletop clock moves with active session time and the physical buttons have A/B plaques.

The public sources.html and assets/reading/provenance.json document image origins, original pixel crops, verified transcriptions and artist credits. The game uses source excerpts, not the commercial Founder font or AI-generated letterforms. Source artworks remain © Xu Bing; this is an independent reading exercise.

Vercel serves the repository statically with an explicit /abtest2 → /abtest2/ redirect and directory rewrite. No build or installation required. Main portfolio and /abtest are preserved. The runtime manifest lists deployable file hashes; do not add source credentials, generation metadata or local QA outputs to this folder.
