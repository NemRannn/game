import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../server/Room.js';

test('Snake can coil and overlap its own body without dying (Snake.io authentic mechanic)', () => {
  const room = new Room({ code: '888999', mode: 'ffa', botCount: 0 });
  const mockSocket = { id: 's_coil', emit: () => {} };
  const snake = room.addPlayer(mockSocket, 'Coiler', 'cat');

  // Coiled body with 12 segments where head overlaps segment 8
  snake.x = 200;
  snake.y = 200;
  snake.segments = [
    { x: 200, y: 200 }, // head
    { x: 210, y: 200 },
    { x: 220, y: 210 },
    { x: 230, y: 220 },
    { x: 230, y: 230 },
    { x: 220, y: 230 },
    { x: 210, y: 220 },
    { x: 205, y: 210 },
    { x: 200, y: 200 }, // segment 8 overlapping head!
    { x: 195, y: 195 },
    { x: 190, y: 190 }
  ];

  room.checkCollisions();

  assert.equal(snake.isAlive, true, 'Snake should NOT die from hitting its own body/tail');
  room.stop();
});
