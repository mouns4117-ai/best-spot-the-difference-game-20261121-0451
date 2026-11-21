// Lantern Market — the hand-in program (Node 22, standard library only).
// It gathers the playable game and its screenshots from beside this file
// and writes them to the output directory, together with the dossier the
// judge reads, built by the vendored make.fun library.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used.
// The program runs twice and must write the same bytes both times: it
// copies files and writes the dossier from them, nothing else, so the
// output is a pure function of this repository.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps for this bounty, from its competition rules: at most
// 4 screenshots of 256 KiB each, at most 993 files and directories in
// game/ totalling 48 MiB, and dossier text capped at 160 KiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(from, to) {
  if (!existsSync(from)) throw new Error(`missing directory: ${from}`);
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function handIn() {
  // Start from a clean output directory so a stale file can never survive
  // into the entry.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  copyTree(join(repoRoot, 'game'), join(outDir, 'game'));
  copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`Lantern Market handed in to ${outDir} (${dossier.length} byte dossier).`);
}

handIn();
