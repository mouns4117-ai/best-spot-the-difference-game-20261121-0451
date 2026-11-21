// The three scenes of Lantern Market. Each scene paints one picture into a
// 580x560 panel. `paint(ctx, diffs)` draws the picture with the given
// difference ids applied; the left panel always passes an empty set, the
// right panel passes the scene's full set, so the two pictures differ only
// where a difference says so. Each difference also carries the spot the
// player must click (panel-local x, y and radius).

import { circle, ellipse, rect, rrect, line, poly, star, text, sky, ground } from './draw.js';

export const PANEL_W = 580;
export const PANEL_H = 560;

// ---------------------------------------------------------------- night market

function paintNightMarket(ctx, d) {
  sky(ctx, PANEL_W, PANEL_H, '#1b1440', '#3a2358');
  // Stars.
  const stars = [[60, 50], [150, 30], [250, 60], [330, 35], [430, 45], [520, 30], [90, 110], [300, 90], [500, 110]];
  for (const [x, y] of stars) star(ctx, x, y, 4, 2, '#ffe9a8');
  // Moon: full on the left picture, a crescent on the right one.
  if (d.has('moon')) {
    circle(ctx, 480, 70, 26, '#ffe9a8');
    circle(ctx, 492, 64, 22, '#1b1440');
  } else {
    circle(ctx, 480, 70, 26, '#ffe9a8');
  }
  // String lights across the top.
  line(ctx, 20, 120, 560, 120, '#6b4f9e', 3);
  for (let i = 0; i < 9; i++) {
    const x = 50 + i * 60;
    circle(ctx, x, 128, 7, ['#ff5d5d', '#ffd166', '#7ee081', '#6ec6ff'][i % 4]);
  }
  // Bunting flags below the lights.
  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 66;
    const col = d.has('bunting') && i === 4 ? '#7ee081' : ['#ff5d5d', '#ffd166', '#6ec6ff', '#ff9fde'][i % 4];
    poly(ctx, [[x, 150], [x + 26, 150], [x + 13, 178]], col);
  }
  // Ground: cobblestones.
  ground(ctx, PANEL_W, PANEL_H, 380, '#4a3a5e');
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      ellipse(ctx, 40 + c * 72 + (r % 2) * 30, 400 + r * 42, 26, 12, r % 2 ? '#554466' : '#4f4066');
    }
  }
  // Left stall: striped awning, counter, goods.
  const stripes = d.has('awning') ? 4 : 5;
  for (let i = 0; i < stripes; i++) {
    rect(ctx, 40 + i * 36, 200, 34, 34, i % 2 ? '#ffd166' : '#ff5d5d');
  }
  rect(ctx, 40, 234, 180, 10, '#7a5a3a');
  rect(ctx, 48, 244, 164, 90, '#8b6b45');
  rect(ctx, 48, 244, 164, 12, '#6b4f30');
  // Goods on the stall: teapots and cups.
  circle(ctx, 80, 232, 10, '#7ee081');
  circle(ctx, 120, 232, 10, '#6ec6ff');
  circle(ctx, 160, 232, 10, '#ff9fde');
  text(ctx, 'TEA', 130, 300, 22, '#ffe9a8');
  // Vendor behind the stall.
  circle(ctx, 130, 350, 16, '#f2c9a0');
  if (d.has('hat')) {
    // Flat cap on the right picture.
    ellipse(ctx, 130, 338, 20, 7, '#3a7d44');
  } else {
    // Pointed straw hat on the left picture.
    poly(ctx, [[104, 340], [156, 340], [130, 312]], '#e8c96a');
    ellipse(ctx, 130, 340, 28, 6, '#e8c96a');
  }
  rect(ctx, 112, 366, 36, 40, '#5d8a6a');
  // Right stall: hanging paper lanterns.
  rect(ctx, 380, 210, 10, 130, '#7a5a3a');
  const lanternCol = d.has('lantern') ? '#7ee081' : '#ff5d5d';
  ellipse(ctx, 420, 260, 26, 32, lanternCol);
  line(ctx, 420, 228, 420, 292, '#c94f4f', 3);
  ellipse(ctx, 470, 250, 20, 25, '#ffd166');
  ellipse(ctx, 510, 270, 16, 20, '#6ec6ff');
  // Balloons tied to the right stall.
  const balloons = d.has('balloons') ? 2 : 3;
  const bcols = ['#ff5d5d', '#ffd166', '#6ec6ff'];
  for (let i = 0; i < balloons; i++) {
    const bx = 500 + i * 26;
    const by = 340 + (i % 2) * 18;
    ellipse(ctx, bx, by, 14, 18, bcols[i]);
    line(ctx, bx, by + 18, 480, 420, '#c9b8e8', 1);
  }
  // Crates stacked by the right stall.
  const crates = d.has('crates') ? 2 : 3;
  for (let i = 0; i < crates; i++) {
    rect(ctx, 470, 470 - i * 36, 46, 34, '#a9804f');
    rect(ctx, 470, 470 - i * 36, 46, 5, '#8b6b3a');
  }
  // The market cat, sitting on a crate (gone on the right picture).
  if (!d.has('cat')) {
    ellipse(ctx, 300, 470, 34, 26, '#2e2a33');
    circle(ctx, 300, 438, 18, '#2e2a33');
    poly(ctx, [[286, 426], [292, 408], [300, 424]], '#2e2a33');
    poly(ctx, [[300, 424], [308, 408], [314, 426]], '#2e2a33');
    circle(ctx, 293, 436, 2, '#ffd166');
    circle(ctx, 307, 436, 2, '#ffd166');
    line(ctx, 326, 462, 352, 452, '#2e2a33', 5);
  }
  // Sign board over the stalls.
  rrect(ctx, 210, 120, 160, 34, 8, '#2c2140');
  text(ctx, 'LANTERN MARKET', 290, 137, 15, '#ffd166');
}

const NIGHT_MARKET = {
  id: 'night-market',
  name: 'Night Market',
  subtitle: 'Lanterns, stalls and one very smug cat.',
  timeLimit: 150,
  differences: [
    { id: 'moon', x: 480, y: 70, r: 30, label: 'the moon' },
    { id: 'lantern', x: 420, y: 260, r: 30, label: 'the big lantern' },
    { id: 'cat', x: 300, y: 445, r: 32, label: 'the cat' },
    { id: 'balloons', x: 520, y: 350, r: 32, label: 'the balloons' },
    { id: 'awning', x: 201, y: 217, r: 30, label: 'the awning stripes' },
    { id: 'hat', x: 130, y: 330, r: 28, label: "the vendor's hat" },
    { id: 'crates', x: 493, y: 430, r: 30, label: 'the crates' },
    { id: 'bunting', x: 304, y: 162, r: 26, label: 'the bunting flag' },
  ],
  paint: paintNightMarket,
};

// ---------------------------------------------------------------- garden at dawn

function paintGarden(ctx, d) {
  sky(ctx, PANEL_W, PANEL_H, '#ffd9a0', '#bfe3c6');
  // Sun: with rays on the left picture, bare on the right one.
  circle(ctx, 90, 80, 34, '#ffdf6b');
  if (!d.has('sun')) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      line(ctx, 90 + Math.cos(a) * 42, 80 + Math.sin(a) * 42, 90 + Math.cos(a) * 58, 80 + Math.sin(a) * 58, '#ffdf6b', 5);
    }
  }
  // Clouds: an extra small cloud on the right picture.
  ellipse(ctx, 300, 70, 46, 16, '#ffffff');
  ellipse(ctx, 330, 62, 30, 14, '#ffffff');
  ellipse(ctx, 470, 110, 40, 14, '#ffffff');
  if (d.has('cloud')) {
    ellipse(ctx, 190, 130, 34, 12, '#ffffff');
    ellipse(ctx, 210, 122, 22, 10, '#ffffff');
  }
  // Hills.
  ellipse(ctx, 120, 560, 320, 130, '#8fc98f');
  ellipse(ctx, 480, 580, 340, 140, '#7cb87c');
  ground(ctx, PANEL_W, PANEL_H, 470, '#6aa86a');
  // The big tree on the left.
  rect(ctx, 100, 300, 26, 180, '#7a5230');
  circle(ctx, 113, 260, 78, '#3f8f4f');
  circle(ctx, 70, 290, 44, '#4a9f5c');
  circle(ctx, 160, 290, 44, '#4a9f5c');
  // Apples: five on the left picture, four on the right one.
  const apples = d.has('apples') ? [[80, 250], [120, 230], [155, 260], [95, 290]] : [[80, 250], [120, 230], [155, 260], [95, 290], [140, 300]];
  for (const [x, y] of apples) circle(ctx, x, y, 9, '#e84a4a');
  // Bird: wings folded on the left picture, wings spread on the right one.
  ellipse(ctx, 175, 215, 20, 12, '#5b7fb8');
  circle(ctx, 192, 210, 8, '#5b7fb8');
  poly(ctx, [[200, 210], [212, 206], [212, 214]], '#f2a541');
  if (d.has('bird')) {
    line(ctx, 168, 208, 150, 188, '#5b7fb8', 4);
    line(ctx, 182, 208, 196, 186, '#5b7fb8', 4);
  } else {
    line(ctx, 160, 214, 190, 214, '#4a6b9e', 3);
  }
  // Fence across the middle.
  const posts = d.has('fence') ? 4 : 5;
  line(ctx, 230, 420, 560, 420, '#e8dcc0', 6);
  line(ctx, 230, 445, 560, 445, '#e8dcc0', 6);
  for (let i = 0; i < posts; i++) {
    const x = 250 + i * 70;
    rect(ctx, x, 400, 12, 62, '#c9a86a');
    poly(ctx, [[x - 2, 400], [x + 14, 400], [x + 6, 388]], '#c9a86a');
  }
  // Flower bed along the bottom.
  const flowers = [
    [60, 520, '#ff6b9d'], [130, 530, '#ffd166'], [200, 520, '#6ec6ff'], [280, 532, '#ff6b9d'],
    [360, 522, '#ffd166'], [440, 530, '#6ec6ff'], [520, 522, '#ff6b9d'],
  ];
  for (const [x, y, col] of flowers) {
    line(ctx, x, y, x, y + 22, '#2f7d3f', 3);
    const petal = d.has('flower') && x === 200 ? '#ff6b9d' : col;
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5 - Math.PI / 2;
      circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 5, petal);
    }
    circle(ctx, x, y, 6, '#ffdf6b');
  }
  // Pond with fish on the right.
  ellipse(ctx, 440, 500, 90, 26, '#6ec6ff');
  ellipse(ctx, 440, 500, 90, 26, 'rgba(255,255,255,0.25)');
  const fish = d.has('fish') ? [[420, 498]] : [[415, 498], [465, 505]];
  for (const [x, y] of fish) {
    ellipse(ctx, x, y, 14, 7, '#ff9f43');
    poly(ctx, [[x + 14, y], [x + 24, y - 6], [x + 24, y + 6]], '#ff9f43');
  }
  // Butterfly near the flowers (gone on the right picture).
  if (!d.has('butterfly')) {
    ellipse(ctx, 320, 470, 12, 16, '#b388ff');
    ellipse(ctx, 340, 470, 12, 16, '#b388ff');
    line(ctx, 330, 462, 330, 486, '#333', 2);
  }
  // Bee buzzing by the tree (gone on the right picture).
  if (!d.has('bee')) {
    ellipse(ctx, 230, 300, 12, 9, '#ffd166');
    line(ctx, 226, 292, 226, 308, '#333', 2);
    line(ctx, 234, 292, 234, 308, '#333', 2);
    ellipse(ctx, 222, 292, 7, 4, 'rgba(255,255,255,0.7)');
  }
  // Snail on the path (gone on the right picture).
  if (!d.has('snail')) {
    ellipse(ctx, 300, 545, 16, 9, '#8a6d4b');
    circle(ctx, 290, 540, 9, '#c96f4a');
    line(ctx, 306, 538, 312, 528, '#8a6d4b', 2);
    line(ctx, 308, 538, 314, 530, '#8a6d4b', 2);
  }
  // Watering can by the fence.
  rrect(ctx, 250, 470, 40, 26, 6, '#7a8a99');
  poly(ctx, [[290, 474], [312, 462], [312, 470], [290, 482]], '#7a8a99');
  rect(ctx, 246, 462, 10, 12, '#5d6b7a');
}

const GARDEN = {
  id: 'garden',
  name: 'Garden at Dawn',
  subtitle: 'A quiet garden, waking up.',
  timeLimit: 150,
  differences: [
    { id: 'sun', x: 90, y: 80, r: 32, label: "the sun's rays" },
    { id: 'flower', x: 200, y: 520, r: 26, label: 'the blue flower' },
    { id: 'butterfly', x: 330, y: 472, r: 26, label: 'the butterfly' },
    { id: 'bird', x: 185, y: 212, r: 28, label: 'the bird' },
    { id: 'fish', x: 465, y: 505, r: 26, label: 'the second fish' },
    { id: 'apples', x: 140, y: 300, r: 26, label: 'the fifth apple' },
    { id: 'snail', x: 300, y: 542, r: 26, label: 'the snail' },
    { id: 'bee', x: 230, y: 300, r: 26, label: 'the bee' },
    { id: 'fence', x: 530, y: 425, r: 28, label: 'the fence post' },
    { id: 'cloud', x: 200, y: 126, r: 28, label: 'the small cloud' },
  ],
  paint: paintGarden,
};

// ---------------------------------------------------------------- workshop

function paintWorkshop(ctx, d) {
  // Wall and floor.
  rect(ctx, 0, 0, PANEL_W, 420, '#b08968');
  ground(ctx, PANEL_W, PANEL_H, 420, '#8a6b4a');
  line(ctx, 0, 420, PANEL_W, 420, '#6b4f30', 4);
  // Window with a curtain: open on the left picture, drawn on the right one.
  rrect(ctx, 60, 60, 150, 170, 6, '#2c3e50');
  rect(ctx, 68, 68, 134, 154, '#a8d8ea');
  circle(ctx, 170, 100, 18, '#ffdf6b');
  ellipse(ctx, 100, 200, 40, 10, '#7cb87c');
  ellipse(ctx, 150, 210, 50, 12, '#6aa86a');
  line(ctx, 135, 68, 135, 222, '#2c3e50', 4);
  line(ctx, 68, 145, 202, 145, '#2c3e50', 4);
  if (d.has('curtain')) {
    rect(ctx, 68, 68, 62, 154, '#c94f4f');
    rect(ctx, 140, 68, 62, 154, '#c94f4f');
    line(ctx, 68, 100, 130, 100, '#a83f3f', 2);
    line(ctx, 140, 100, 202, 100, '#a83f3f', 2);
  } else {
    rect(ctx, 56, 56, 24, 178, '#c94f4f');
    rect(ctx, 190, 56, 24, 178, '#c94f4f');
  }
  // Clock on the wall: 3 o'clock on the left, 9 o'clock on the right.
  circle(ctx, 330, 110, 42, '#f5ead6');
  circle(ctx, 330, 110, 42, '#2c3e50');
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(330, 110, 42, 0, Math.PI * 2);
  ctx.stroke();
  circle(ctx, 330, 110, 38, '#f5ead6');
  line(ctx, 330, 110, 330, 82, '#2c3e50', 4);
  if (d.has('clock')) line(ctx, 330, 110, 304, 110, '#2c3e50', 4);
  else line(ctx, 330, 110, 356, 110, '#2c3e50', 4);
  circle(ctx, 330, 110, 4, '#c94f4f');
  // Gears on the wall: three on the left, two on the right.
  const gears = d.has('gear') ? [[450, 90], [510, 140]] : [[450, 90], [510, 140], [480, 200]];
  for (const [gx, gy] of gears) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      rect(ctx, gx + Math.cos(a) * 26 - 5, gy + Math.sin(a) * 26 - 5, 10, 10, '#8a8f98');
    }
    circle(ctx, gx, gy, 24, '#aab0b8');
    circle(ctx, gx, gy, 9, '#5d6b7a');
  }
  // Poster: a rocket on the left, a star on the right.
  rrect(ctx, 60, 270, 110, 130, 6, '#f5ead6');
  if (d.has('poster')) {
    star(ctx, 115, 335, 34, 14, '#f2a541');
  } else {
    poly(ctx, [[115, 295], [130, 340], [115, 330], [100, 340]], '#5b7fb8');
    circle(ctx, 115, 350, 12, '#ff5d5d');
    star(ctx, 115, 300, 6, 3, '#ffd166');
  }
  text(ctx, 'TO THE MOON', 115, 385, 10, '#2c3e50');
  // Shelf with jars: four on the left, three on the right.
  rect(ctx, 220, 260, 200, 12, '#7a5a3a');
  const jars = d.has('jars') ? 3 : 4;
  const jarCols = ['#7ee081', '#6ec6ff', '#ffd166', '#ff9fde'];
  for (let i = 0; i < jars; i++) {
    const jx = 235 + i * 48;
    rrect(ctx, jx, 222, 34, 38, 6, jarCols[i]);
    rect(ctx, jx + 6, 214, 22, 10, '#5d6b7a');
  }
  // Pegboard with tools.
  rrect(ctx, 440, 260, 120, 150, 8, '#c9a86a');
  // Saw.
  poly(ctx, [[460, 300], [500, 300], [500, 320], [460, 320]], '#c0c6cc');
  rect(ctx, 500, 302, 18, 16, '#5d3a1a');
  // Wrench (gone on the right picture).
  if (!d.has('wrench')) {
    circle(ctx, 530, 300, 10, '#c0c6cc');
    circle(ctx, 530, 300, 5, '#c9a86a');
    line(ctx, 530, 310, 530, 340, '#c0c6cc', 6);
  }
  // Hammer: hanging on the pegboard on the left, lying on the bench on the right.
  if (!d.has('hammer')) {
    rect(ctx, 462, 340, 10, 46, '#7a5230');
    rect(ctx, 452, 332, 30, 14, '#5d6b7a');
  }
  // Workbench.
  rect(ctx, 180, 430, 340, 18, '#7a5a3a');
  rect(ctx, 196, 448, 14, 90, '#6b4f30');
  rect(ctx, 490, 448, 14, 90, '#6b4f30');
  // Blueprint on the bench: flat on the left, rolled on the right.
  if (d.has('blueprint')) {
    ellipse(ctx, 300, 440, 46, 10, '#e8f0f2');
    line(ctx, 254, 440, 346, 440, '#5b7fb8', 2);
  } else {
    rrect(ctx, 250, 424, 100, 12, 4, '#e8f0f2');
    line(ctx, 260, 430, 340, 430, '#5b7fb8', 1);
    line(ctx, 260, 426, 300, 426, '#5b7fb8', 1);
  }
  // Lamp on the bench: lit on the left, dark on the right.
  line(ctx, 480, 430, 480, 390, '#333', 4);
  ellipse(ctx, 480, 432, 18, 5, '#333');
  if (d.has('lamp')) {
    poly(ctx, [[460, 392], [500, 392], [488, 368], [472, 368]], '#5d6b7a');
    circle(ctx, 480, 396, 8, '#8a8f98');
  } else {
    poly(ctx, [[460, 392], [500, 392], [488, 368], [472, 368]], '#ffd166');
    circle(ctx, 480, 396, 8, '#fff3b0');
    poly(ctx, [[468, 392], [492, 392], [500, 430], [460, 430]], 'rgba(255, 223, 107, 0.25)');
  }
  // Mug on the bench: blue on the left, red on the right.
  const mugCol = d.has('mug') ? '#e84a4a' : '#3f7fbf';
  rrect(ctx, 380, 408, 26, 24, 4, mugCol);
  ctx.strokeStyle = mugCol;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(410, 420, 8, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Cat asleep on the bench (gone on the right picture).
  if (!d.has('cat')) {
    ellipse(ctx, 220, 424, 30, 12, '#2e2a33');
    circle(ctx, 244, 418, 10, '#2e2a33');
    poly(ctx, [[238, 410], [242, 402], [246, 410]], '#2e2a33');
  }
  // Hammer lying on the bench on the right picture.
  if (d.has('hammer')) {
    rect(ctx, 420, 442, 46, 8, '#7a5230');
    rect(ctx, 456, 436, 14, 18, '#5d6b7a');
  }
  // Chair by the bench: four legs on the left, three on the right.
  rect(ctx, 60, 460, 70, 12, '#7a5a3a');
  rect(ctx, 60, 400, 12, 62, '#7a5a3a');
  const chairLegs = d.has('chair') ? [64, 90, 116] : [64, 90, 116, 128];
  for (const lx of chairLegs) rect(ctx, lx, 472, 8, 60, '#6b4f30');
}

const WORKSHOP = {
  id: 'workshop',
  name: 'The Workshop',
  subtitle: 'Every tool has its place. Mostly.',
  timeLimit: 180,
  differences: [
    { id: 'clock', x: 330, y: 110, r: 30, label: 'the clock hands' },
    { id: 'gear', x: 480, y: 200, r: 28, label: 'the third gear' },
    { id: 'lamp', x: 480, y: 385, r: 28, label: 'the lamp' },
    { id: 'mug', x: 393, y: 420, r: 26, label: 'the mug' },
    { id: 'cat', x: 228, y: 420, r: 28, label: 'the sleeping cat' },
    { id: 'hammer', x: 467, y: 355, r: 28, label: 'the hammer' },
    { id: 'jars', x: 380, y: 240, r: 28, label: 'the fourth jar' },
    { id: 'curtain', x: 135, y: 145, r: 30, label: 'the curtain' },
    { id: 'poster', x: 115, y: 335, r: 30, label: 'the poster' },
    { id: 'wrench', x: 530, y: 315, r: 28, label: 'the wrench' },
    { id: 'blueprint', x: 300, y: 432, r: 28, label: 'the blueprint' },
    { id: 'chair', x: 128, y: 500, r: 28, label: 'the chair leg' },
  ],
  paint: paintWorkshop,
};

export const SCENES = [NIGHT_MARKET, GARDEN, WORKSHOP];
