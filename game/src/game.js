// Lantern Market: the game itself. State machine, input, timer, hints and
// the render loop. The two pictures live on one canvas, side by side; the
// left picture is always the scene as painted, the right picture is the
// same scene with every difference applied.

import { SCENES, PANEL_W, PANEL_H } from './scenes.js';
import { chime, buzz, winJingle, hintBlip, tick } from './audio.js';

const LEFT_X = 40;
const RIGHT_X = 660;
const PANEL_Y = 20;
const FOUND_POINTS = 100;
const HINT_COST = 50;
const HINT_SECONDS = 3;

function $(id) {
  return document.getElementById(id);
}

export class LanternMarketGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'title'; // title | playing | sceneDone | timeUp | results
    this.sceneIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.hintsLeft = 3;
    this.timeLeft = 0;
    this.lastTickSecond = -1;
    this.hintSpot = null; // { x, y, until }
    this.wrongSpot = null; // { x, y, until }
    this.flashFound = null; // { x, y, until } — the newest find, drawn bigger
    this.lastFrame = 0;
    this.totalFound = 0;
    this.scenesCleared = 0;

    canvas.addEventListener('click', (e) => this.onClick(e));
    $('hint-btn').addEventListener('click', () => this.useHint());
    $('restart-btn').addEventListener('click', () => this.restartScene());
    $('overlay-btn').addEventListener('click', () => this.onOverlayButton());
    document.addEventListener('keydown', (e) => this.onKey(e));

    this.showTitle();
    requestAnimationFrame((t) => this.loop(t));
  }

  get scene() {
    return SCENES[this.sceneIndex];
  }

  get allDiffIds() {
    return new Set(this.scene.differences.map((d) => d.id));
  }

  // ------------------------------------------------------------ overlays

  showOverlay(title, text, stats, btnLabel) {
    $('overlay-title').textContent = title;
    $('overlay-text').textContent = text;
    $('overlay-stats').innerHTML = stats;
    $('overlay-btn').textContent = btnLabel;
    $('overlay').classList.remove('hidden');
  }

  hideOverlay() {
    $('overlay').classList.add('hidden');
  }

  showTitle() {
    this.state = 'title';
    this.updateHud();
    this.showOverlay(
      '🏮 Lantern Market',
      'Two pictures hang side by side in the lantern light. They look the same — but they are not. ' +
        'Find every difference across three scenes: the Night Market, the Garden at Dawn and the Workshop. ' +
        'Click a difference on either picture to mark it. Wrong clicks cost 5 points; hints cost 50.',
      '3 scenes · 30 differences · hints: H · restart: R',
      'Start playing',
    );
  }

  startGame() {
    this.score = 0;
    this.totalFound = 0;
    this.scenesCleared = 0;
    this.sceneIndex = 0;
    this.hideOverlay();
    this.startScene(0);
  }

  startScene(i) {
    this.sceneIndex = i;
    this.found = new Set();
    this.hintsLeft = 3;
    this.timeLeft = this.scene.timeLimit;
    this.lastTickSecond = -1;
    this.hintSpot = null;
    this.wrongSpot = null;
    this.flashFound = null;
    this.state = 'playing';
    this.hideOverlay();
    this.setMessage(`Scene ${i + 1} of 3 — ${this.scene.name}. Find ${this.scene.differences.length} differences!`);
    this.updateHud();
  }

  restartScene() {
    if (this.state === 'playing' || this.state === 'timeUp') this.startScene(this.sceneIndex);
  }

  onOverlayButton() {
    if (this.state === 'title') this.startGame();
    else if (this.state === 'sceneDone') this.nextScene();
    else if (this.state === 'timeUp') this.startScene(this.sceneIndex);
    else if (this.state === 'results') this.startGame();
  }

  nextScene() {
    if (this.sceneIndex + 1 < SCENES.length) this.startScene(this.sceneIndex + 1);
    else this.showResults();
  }

  showResults() {
    this.state = 'results';
    const total = SCENES.reduce((n, s) => n + s.differences.length, 0);
    this.showOverlay(
      '🎉 Market closed — well played!',
      `You found ${this.totalFound} of ${total} differences and cleared ${this.scenesCleared} of 3 scenes.`,
      `Final score: ★ ${this.score}<br>Play again to beat it!`,
      'Play again',
    );
  }

  // ------------------------------------------------------------ input

  onKey(e) {
    if (e.key === 'h' || e.key === 'H') this.useHint();
    else if (e.key === 'r' || e.key === 'R') this.restartScene();
    else if (e.key === 'n' || e.key === 'N') {
      if (this.state === 'sceneDone') this.nextScene();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (this.state !== 'playing') this.onOverlayButton();
    }
  }

  canvasPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * this.canvas.height,
    };
  }

  onClick(e) {
    if (this.state !== 'playing') return;
    const p = this.canvasPoint(e);
    // Which panel did the click land in?
    let panelX = null;
    if (p.x >= LEFT_X && p.x < LEFT_X + PANEL_W && p.y >= PANEL_Y && p.y < PANEL_Y + PANEL_H) panelX = LEFT_X;
    else if (p.x >= RIGHT_X && p.x < RIGHT_X + PANEL_W && p.y >= PANEL_Y && p.y < PANEL_Y + PANEL_H) panelX = RIGHT_X;
    if (panelX === null) return;
    const lx = p.x - panelX;
    const ly = p.y - PANEL_Y;
    for (const diff of this.scene.differences) {
      if (this.found.has(diff.id)) continue;
      const dx = lx - diff.x;
      const dy = ly - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        this.markFound(diff);
        return;
      }
    }
    // A wrong click: a red X flash and a small penalty.
    this.wrongSpot = { x: lx, y: ly, panelX, until: performance.now() + 450 };
    this.score = Math.max(0, this.score - 5);
    buzz();
    this.setMessage('Not a difference — look closer!');
    this.updateHud();
  }

  markFound(diff) {
    this.found.add(diff.id);
    this.totalFound++;
    this.score += FOUND_POINTS;
    this.flashFound = { x: diff.x, y: diff.y, until: performance.now() + 900 };
    chime();
    const n = this.found.size;
    const total = this.scene.differences.length;
    this.setMessage(`Found: ${diff.label}! (${n} / ${total})`);
    this.updateHud();
    if (n === total) this.sceneCleared();
  }

  sceneCleared() {
    this.state = 'sceneDone';
    this.scenesCleared++;
    const bonus = Math.floor(this.timeLeft) * 5;
    this.score += bonus;
    winJingle();
    const last = this.sceneIndex + 1 === SCENES.length;
    this.showOverlay(
      `✨ ${this.scene.name} — cleared!`,
      `Every difference found, with ${this.formatTime(this.timeLeft)} to spare.`,
      `Time bonus: +${bonus} ★<br>Total score: ★ ${this.score}`,
      last ? 'See results' : 'Next scene →',
    );
    this.updateHud();
  }

  timeUp() {
    this.state = 'timeUp';
    const n = this.found.size;
    const total = this.scene.differences.length;
    this.showOverlay(
      `⏱ Time's up in ${this.scene.name}`,
      `You found ${n} of ${total} differences before the lanterns dimmed.`,
      `Score so far: ★ ${this.score}`,
      'Retry this scene',
    );
  }

  useHint() {
    if (this.state !== 'playing') return;
    if (this.hintsLeft <= 0) {
      this.setMessage('No hints left in this scene.');
      return;
    }
    const remaining = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft--;
    this.score = Math.max(0, this.score - HINT_COST);
    this.hintSpot = { x: pick.x, y: pick.y, until: performance.now() + HINT_SECONDS * 1000 };
    hintBlip();
    this.setMessage(`Hint: look near ${pick.label}… (−${HINT_COST} ★)`);
    this.updateHud();
  }

  // ------------------------------------------------------------ hud

  formatTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  setMessage(msg) {
    $('message').textContent = msg;
    $('status').textContent = msg;
  }

  updateHud() {
    $('scene-name').textContent = this.scene ? `${this.scene.name} — ${this.scene.subtitle}` : '';
    $('counter').textContent = `Found ${this.found.size} / ${this.scene ? this.scene.differences.length : 0}`;
    $('timer').textContent = `⏱ ${this.formatTime(this.timeLeft)}`;
    $('timer').classList.toggle('low', this.state === 'playing' && this.timeLeft <= 10);
    $('score').textContent = `★ ${this.score}`;
    $('hints-left').textContent = String(this.hintsLeft);
    $('hint-btn').disabled = this.state !== 'playing' || this.hintsLeft <= 0;
    $('restart-btn').disabled = this.state !== 'playing' && this.state !== 'timeUp';
  }

  // ------------------------------------------------------------ render loop

  loop(t) {
    const dt = this.lastFrame === 0 ? 0 : (t - this.lastFrame) / 1000;
    this.lastFrame = t;
    if (this.state === 'playing') {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (whole !== this.lastTickSecond) {
        this.lastTickSecond = whole;
        if (whole <= 10 && whole > 0) tick();
        this.updateHud();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.updateHud();
        this.timeUp();
      }
    }
    this.render(t);
    requestAnimationFrame((nt) => this.loop(nt));
  }

  drawPanelFrame(x) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#4a3670';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x - 4, PANEL_Y - 4, PANEL_W + 8, PANEL_H + 8, 12);
    ctx.stroke();
    ctx.restore();
  }

  drawFoundMarker(x, y, big) {
    const ctx = this.ctx;
    const r = big ? 30 : 24;
    ctx.save();
    ctx.strokeStyle = '#37d67a';
    ctx.lineWidth = big ? 6 : 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#37d67a';
    ctx.lineWidth = big ? 6 : 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 11, y);
    ctx.lineTo(x - 3, y + 9);
    ctx.lineTo(x + 12, y - 10);
    ctx.stroke();
    ctx.restore();
  }

  drawHintRing(x, y, t) {
    const ctx = this.ctx;
    const pulse = 1 + 0.12 * Math.sin(t / 120);
    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(x, y, 30 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawWrongX(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12);
    ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
    ctx.restore();
  }

  render(t) {
    const ctx = this.ctx;
    const now = performance.now();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#1d1730';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const scene = this.scene;
    const diffs = this.allDiffIds;

    // Left picture: the scene as painted. Right picture: every difference on.
    ctx.save();
    ctx.beginPath();
    ctx.rect(LEFT_X, PANEL_Y, PANEL_W, PANEL_H);
    ctx.clip();
    ctx.translate(LEFT_X, PANEL_Y);
    scene.paint(ctx, new Set());
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(RIGHT_X, PANEL_Y, PANEL_W, PANEL_H);
    ctx.clip();
    ctx.translate(RIGHT_X, PANEL_Y);
    scene.paint(ctx, diffs);
    ctx.restore();

    this.drawPanelFrame(LEFT_X);
    this.drawPanelFrame(RIGHT_X);

    // Panel labels, on a dark chip so they read on light scenes too.
    ctx.save();
    for (const [lx, letter] of [[LEFT_X, 'A'], [RIGHT_X, 'B']]) {
      ctx.fillStyle = 'rgba(20, 12, 40, 0.7)';
      ctx.beginPath();
      ctx.roundRect(lx + 6, PANEL_Y + 6, 26, 26, 7);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, lx + 19, PANEL_Y + 20);
    }
    ctx.restore();

    // Markers on every difference found so far, on both pictures.
    for (const diff of scene.differences) {
      if (!this.found.has(diff.id)) continue;
      const big = this.flashFound && this.flashFound.x === diff.x && this.flashFound.y === diff.y && now < this.flashFound.until;
      this.drawFoundMarker(LEFT_X + diff.x, PANEL_Y + diff.y, big);
      this.drawFoundMarker(RIGHT_X + diff.x, PANEL_Y + diff.y, big);
    }

    // A hint ring pulses on both pictures.
    if (this.hintSpot && now < this.hintSpot.until) {
      this.drawHintRing(LEFT_X + this.hintSpot.x, PANEL_Y + this.hintSpot.y, t);
      this.drawHintRing(RIGHT_X + this.hintSpot.x, PANEL_Y + this.hintSpot.y, t);
    } else if (this.hintSpot) {
      this.hintSpot = null;
    }

    // A wrong click flashes a red X where it landed.
    if (this.wrongSpot && now < this.wrongSpot.until) {
      this.drawWrongX(this.wrongSpot.panelX + this.wrongSpot.x, PANEL_Y + this.wrongSpot.y);
    } else if (this.wrongSpot) {
      this.wrongSpot = null;
    }
  }
}
