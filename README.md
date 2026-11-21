# Lantern Market — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mouns4117-ai/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mouns4117-ai/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that plays offline in a desktop browser from its own files — an entry for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

Two pictures hang side by side in the lantern light. They look the same — but they are not. Find every difference across three hand-drawn scenes:

1. **Night Market** (8 differences) — lanterns, stalls, and one very smug cat.
2. **Garden at Dawn** (10 differences) — a quiet garden, waking up.
3. **The Workshop** (12 differences) — every tool has its place. Mostly.

Every scene is drawn procedurally on canvas — no image assets, no network, no library. Click a difference on either picture to mark it with a green ring and a chime. Hints cost 50 points (H key), wrong clicks cost 5, and each scene has its own timer. Clear a scene for a time bonus and move on to the next.

## Play it

Serve `game/` with any static server and open it in a desktop browser:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

Or with Node (the repo's own server is not included; any static server works). Mouse and keyboard: click to mark a difference, `H` for a hint, `R` to restart the scene, `N` for the next scene, `Enter` to start.

## Hand in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Run it twice and the output is byte-identical. Screenshots in `screenshots/` are real renders of the game's own code, taken in Chromium while playing: the cover shows the Night Market mid-game with three differences found and five still unfound.

## Layout

- `main.ts` — the hand-in program
- `vendor/makefun-game.ts` — make.fun's dossier library, copied from the kit unchanged
- `game/index.html` — page shell, HUD and overlays
- `game/styles.css` — layout and styling
- `game/src/main.js` — bootstrap
- `game/src/game.js` — state machine, input, timer, hints, render loop
- `game/src/scenes.js` — the three scenes: what each picture shows and where its differences hide
- `game/src/draw.js` — small canvas drawing helpers
- `game/src/audio.js` — WebAudio tones (no audio files)
- `screenshots/` — 4 renders of the game in play

## License

MIT — see [LICENSE](LICENSE).
