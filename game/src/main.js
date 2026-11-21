// Lantern Market bootstrap: build the game on the page's canvas and expose
// it for play-testing (window.__game carries the live game object, its
// current scene and the canvas coordinates of every difference).

import { LanternMarketGame } from './game.js';

const canvas = document.getElementById('game');
const game = new LanternMarketGame(canvas);

window.__game = {
  game,
  state: () => game.state,
  sceneIndex: () => game.sceneIndex,
  found: () => [...game.found],
  // Canvas coordinates of the current scene's differences, on both pictures.
  diffPoints: () =>
    game.scene.differences.map((d) => ({
      id: d.id,
      left: { x: 40 + d.x, y: 20 + d.y },
      right: { x: 660 + d.x, y: 20 + d.y },
    })),
};
